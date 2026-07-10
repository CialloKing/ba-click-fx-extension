import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');

function readUtf8(path)
{
  return readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
}

function assert(condition, message)
{
  if (!condition)
  {
    throw new Error(message);
  }
}

function assertFile(relativePath)
{
  const path = join(distDir, relativePath);

  assert(existsSync(path), `构建产物缺少 ${relativePath}`);
  assert(statSync(path).isFile(), `${relativePath} 不是普通文件`);
}

assert(existsSync(distDir), '请先执行 npm run build。');

const manifest = JSON.parse(readUtf8(join(distDir, 'manifest.json')));
const packageJson = JSON.parse(readUtf8(join(rootDir, 'package.json')));

assert(manifest.manifest_version === 3, 'manifest_version 必须为 3。');
assert(manifest.version === packageJson.version, 'manifest 与 package.json 版本不一致。');
assert(manifest.minimum_chrome_version === '102', '最低 Chromium 版本必须与构建目标一致。');
assert(Array.isArray(manifest.content_scripts), 'manifest 缺少 content_scripts。');
assert(manifest.content_scripts.length === 1, '应只注册一个顶层内容脚本。');
assert(manifest.content_scripts[0].all_frames === false, '内容脚本不应重复注入 iframe。');
assert(
  manifest.permissions.length === 2 &&
  manifest.permissions.includes('activeTab') &&
  manifest.permissions.includes('storage'),
  'manifest 权限必须严格为 activeTab 与 storage。',
);
assert(
  JSON.stringify(manifest.content_scripts[0].matches) === JSON.stringify([
    'http://*/*',
    'https://*/*',
    'file:///*',
  ]),
  '内容脚本匹配范围发生了未经审核的变化。',
);

for (const script of manifest.content_scripts[0].js)
{
  assertFile(script);
}

assertFile(manifest.action.default_popup);

const popupHtml = readUtf8(join(distDir, manifest.action.default_popup));
const localPopupReferences = [
  ...popupHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g),
].map((match) => match[1]);

for (const reference of localPopupReferences)
{
  assert(!/^https?:/i.test(reference), `弹窗不允许引用远程资源：${reference}`);
  assertFile(join('popup', reference));
}

for (const path of Object.values(manifest.icons))
{
  assertFile(path);
}

for (const path of Object.values(manifest.action.default_icon))
{
  assertFile(path);
}

const contentScript = readUtf8(join(distDir, 'content.js'));
const popupScript = readUtf8(join(distDir, 'popup', 'popup.js'));
const combinedScripts = `${contentScript}\n${popupScript}`;

assert(contentScript.includes('data-ba-click-fx-extension-root'), '内容脚本未包含隔离 Canvas 宿主。');
assert(!/\beval\s*\(/.test(combinedScripts), '构建产物不允许使用 eval。');
assert(!/\bnew\s+Function\s*\(/.test(combinedScripts), '构建产物不允许使用 new Function。');

console.log('Manifest V3 构建产物校验通过。');
