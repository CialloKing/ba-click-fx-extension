import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseTarget } from './targets.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = parseTarget(process.argv.slice(2));
const distDir = join(rootDir, target.distDirectory);

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

assert(existsSync(distDir), `请先构建 ${target.displayName} 扩展。`);

const manifest = JSON.parse(readUtf8(join(distDir, 'manifest.json')));
const packageJson = JSON.parse(readUtf8(join(rootDir, 'package.json')));

assert(manifest.manifest_version === 3, 'manifest_version 必须为 3。');
assert(manifest.version === packageJson.version, 'manifest 与 package.json 版本不一致。');
if (target.name === 'chromium')
{
  assert(manifest.minimum_chrome_version === '102', '最低 Chromium 版本必须与构建目标一致。');
  assert(!manifest.browser_specific_settings, 'Chromium Manifest 不应包含 Gecko 专用设置。');
}
else
{
  const gecko = manifest.browser_specific_settings?.gecko;

  assert(!manifest.minimum_chrome_version, 'Firefox Manifest 不应包含 Chromium 最低版本。');
  assert(
    gecko?.id === 'ba-click-fx-extension@cialloking.top',
    'Firefox Gecko ID 不一致。',
  );
  assert(gecko?.strict_min_version === '140.0', 'Firefox 最低版本必须为 140.0。');
  assert(
    JSON.stringify(gecko?.data_collection_permissions?.required) === JSON.stringify(['none']),
    'Firefox 必须明确声明不收集或传输数据。',
  );
  assert(
    manifest.browser_specific_settings?.gecko_android?.strict_min_version === '142.0',
    'Firefox Android 最低版本声明必须与数据权限支持保持一致。',
  );
}
assert(manifest.default_locale === 'zh_CN', '默认语言必须为 zh_CN。');
assert(manifest.name === '__MSG_extensionName__', '扩展名称必须使用本地化消息。');
assert(manifest.description === '__MSG_extensionDescription__', '扩展描述必须使用本地化消息。');
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
assert(manifest.options_ui?.open_in_tab === true, '设置页必须在独立标签页打开。');
assertFile(manifest.options_ui.page);

const popupHtml = readUtf8(join(distDir, manifest.action.default_popup));
const optionsHtml = readUtf8(join(distDir, manifest.options_ui.page));
const localPopupReferences = [
  ...popupHtml.matchAll(/\bsrc=["']([^"']+)["']/g),
  ...popupHtml.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/g),
].map((match) => match[1]);

for (const reference of localPopupReferences)
{
  assert(!/^https?:/i.test(reference), `弹窗不允许引用远程资源：${reference}`);
  assertFile(join('popup', reference));
}

const localOptionsReferences = [
  ...optionsHtml.matchAll(/\bsrc=["']([^"']+)["']/g),
  ...optionsHtml.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/g),
].map((match) => match[1]);

for (const reference of localOptionsReferences)
{
  if (/^\.\.\//.test(reference))
  {
    assertFile(reference.replace(/^\.\.\//, ''));
    continue;
  }

  assert(!/^https?:/i.test(reference), `设置页不允许引用远程资源：${reference}`);
  assertFile(join('options', reference));
}

assert(
  /<a\b[^>]*href=["']https:\/\/github\.com\/CialloKing\/ba-click-fx-extension["'][^>]*>/i.test(popupHtml),
  '弹窗必须包含项目仓库链接。',
);

for (const path of Object.values(manifest.icons))
{
  assertFile(path);
}

for (const path of Object.values(manifest.action.default_icon))
{
  assertFile(path);
}

const localeMessages = new Map();

for (const locale of ['en', 'zh_CN'])
{
  const messagesPath = join('_locales', locale, 'messages.json');

  assertFile(messagesPath);

  const messages = JSON.parse(readUtf8(join(distDir, messagesPath)));

  localeMessages.set(locale, messages);

  assert(messages.extensionName?.message === 'BA Click FX', `${locale} 扩展名称不一致。`);
  assert(
    typeof messages.extensionDescription?.message === 'string' &&
    messages.extensionDescription.message.length <= 132,
    `${locale} 扩展描述必须存在且不超过 132 个字符。`,
  );
  assert(messages.actionTitle?.message, `${locale} 缺少 actionTitle。`);
}

const contentScript = readUtf8(join(distDir, 'content.js'));
const popupScript = readUtf8(join(distDir, 'popup', 'popup.js'));
const optionsScript = readUtf8(join(distDir, 'options', 'options.js'));
const combinedScripts = `${contentScript}\n${popupScript}\n${optionsScript}`;
const popupMessageKeys = new Set([
  ...[...popupHtml.matchAll(/data-i18n(?:-title)?=["']([^"']+)["']/g)]
    .map((match) => match[1]),
  ...[...popupScript.matchAll(/getMessage\(['"]([^'"]+)['"]/g)]
    .map((match) => match[1]),
]);
const optionsMessageKeys = new Set([
  ...[...optionsHtml.matchAll(/data-i18n(?:-title|-placeholder)?=["']([^"']+)["']/g)]
    .map((match) => match[1]),
  ...[...optionsScript.matchAll(/getMessage\(['"]([^'"]+)['"]/g)]
    .map((match) => match[1]),
]);
const englishMessageKeys = Object.keys(localeMessages.get('en')).sort();
const chineseMessageKeys = Object.keys(localeMessages.get('zh_CN')).sort();

assert(
  JSON.stringify(englishMessageKeys) === JSON.stringify(chineseMessageKeys),
  'en 与 zh_CN 的消息键不一致。',
);

for (const locale of ['en', 'zh_CN'])
{
  const messages = localeMessages.get(locale);

  for (const key of popupMessageKeys)
  {
    assert(messages[key]?.message, `${locale} 缺少弹窗消息：${key}`);
  }

  for (const key of optionsMessageKeys)
  {
    assert(messages[key]?.message, `${locale} 缺少设置页消息：${key}`);
  }
}

assert(contentScript.includes('data-ba-click-fx-extension-root'), '内容脚本未包含隔离 Canvas 宿主。');
assert(!/\beval\s*\(/.test(combinedScripts), '构建产物不允许使用 eval。');
assert(!/\bnew\s+Function\s*\(/.test(combinedScripts), '构建产物不允许使用 new Function。');
assert(
  !/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/.test(combinedScripts),
  '构建产物不应包含网络请求 API，以保持商店隐私披露准确。',
);
assertFile('PRIVACY.md');

console.log(`${target.displayName} Manifest V3 构建产物校验通过。`);
