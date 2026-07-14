import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readJson(path)
{
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
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
  const path = join(rootDir, relativePath);

  assert(existsSync(path), `缺少文件：${relativePath}`);
  assert(statSync(path).isFile(), `缺少文件：${relativePath}`);

  return path;
}

function assertPng(relativePath, expectedWidth, expectedHeight)
{
  const content = readFileSync(assertFile(relativePath));

  assert(content.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE), `${relativePath} 不是 PNG。`);

  const width = content.readUInt32BE(16);
  const height = content.readUInt32BE(20);

  assert(
    width === expectedWidth && height === expectedHeight,
    `${relativePath} 尺寸应为 ${expectedWidth}×${expectedHeight}，实际为 ${width}×${height}。`,
  );
}

const metadata = readJson(join(rootDir, 'store-submission', 'metadata.json'));
const packageJson = readJson(join(rootDir, 'package.json'));
const manifest = readJson(join(rootDir, 'manifest.json'));

assert(metadata.extensionVersion === packageJson.version, '商店元数据与 package.json 版本不一致。');
assert(metadata.extensionVersion === manifest.version, '商店元数据与 Manifest 版本不一致。');
assert(metadata.coreVersion === packageJson.dependencies['ba-click-fx'], '商店元数据与核心依赖版本不一致。');
assert(metadata.locales.join(',') === 'zh_CN,en', '商店语言必须以 zh_CN 为默认语言并包含 en。');
assert(
  metadata.chromiumPackage === `release/ba-click-fx-extension-v${manifest.version}-chromium.zip`,
  '商店元数据中的 Chromium ZIP 文件名与版本不一致。',
);
assert(
  /^[0-9A-F]{64}$/.test(metadata.chromiumSha256),
  '商店元数据中的 Chromium ZIP SHA-256 格式无效。',
);
assert(
  metadata.assets.englishScreenshots.length >= 1 &&
  metadata.assets.englishScreenshots.length <= 5,
  'Chrome 英文截图数量必须为 1–5 张。',
);
assert(
  metadata.assets.chineseScreenshots.length >= 1 &&
  metadata.assets.chineseScreenshots.length <= 5,
  'Chrome 中文截图数量必须为 1–5 张。',
);

for (const urlKey of [
  'homepageUrl',
  'privacyPolicyUrl',
  'edgePrivacyPolicyUrl',
  'supportUrl',
  'repositoryUrl',
  'issueTrackerUrl',
])
{
  assert(/^https:\/\//.test(metadata[urlKey]), `${urlKey} 必须使用 HTTPS。`);
}

for (const path of [
  'PRIVACY.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'store-submission/chrome-web-store.md',
  'store-submission/edge-addons.md',
  'store-submission/reviewer-notes.md',
  'store-submission/data-inventory.md',
  'store-submission/LOCAL_TEST_CHECKLIST.md',
  'store-submission/release-checklist.md',
  'store-submission/firefox-follow-up.md',
  'store-assets/source/options-preview.html',
  'store-assets/source/options-mock.js',
])
{
  assertFile(path);
}

assertPng(metadata.assets.chromeIcon, 128, 128);
assertPng(metadata.assets.logo, 300, 300);
assertPng(metadata.assets.smallPromo, 440, 280);
assertPng(metadata.assets.marqueePromo, 1400, 560);

for (const screenshot of [
  ...metadata.assets.englishScreenshots,
  ...metadata.assets.chineseScreenshots,
])
{
  assertPng(screenshot, 1280, 800);
}

console.log('商店文案、公开页面与图片资源校验通过。');
