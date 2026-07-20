import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { strFromU8, unzipSync } from 'fflate';

import { readJson } from './targets.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = readJson(join(rootDir, 'package.json'));
const manifest = readJson(join(rootDir, 'manifest.json'));
const changelog = readFileSync(join(rootDir, 'CHANGELOG.md'), 'utf8').replace(/^\uFEFF/, '');
const metadata = readJson(join(rootDir, 'store-submission', 'metadata.json'));
const tag = process.argv[2] || process.env.GITHUB_REF_NAME;
const archiveNames =
{
  chromium: `ba-click-fx-extension-v${packageJson.version}-chromium.zip`,
  firefox: `ba-click-fx-extension-v${packageJson.version}-firefox.zip`,
  firefoxSource: `ba-click-fx-extension-v${packageJson.version}-firefox-source.zip`,
};

function assert(condition, message)
{
  if (!condition)
  {
    throw new Error(message);
  }
}

function readArchive(name)
{
  const path = join(rootDir, 'release', name);

  assert(existsSync(path), `缺少发布包 ${name}。`);

  const bytes = readFileSync(path);

  return {
    bytes,
    entries: unzipSync(bytes),
    sha256: createHash('sha256').update(bytes).digest('hex').toUpperCase(),
  };
}

function readArchiveJson(archive, path)
{
  assert(archive.entries[path], `发布包缺少 ${path}。`);

  return JSON.parse(strFromU8(archive.entries[path]).replace(/^\uFEFF/, ''));
}

assert(tag, '缺少待发布的 Git 标签。');
assert(tag === `v${packageJson.version}`, `标签 ${tag} 与 package.json 版本不一致。`);
assert(manifest.version === packageJson.version, '公共 Manifest 与 package.json 版本不一致。');
assert(
  changelog.includes(`## [${packageJson.version}]`),
  `CHANGELOG.md 缺少 ${packageJson.version} 正式版本记录。`,
);
assert(tag !== 'v1.0.4', 'v1.0.4 已保留并明确不发布。');

const chromium = readArchive(archiveNames.chromium);
const firefox = readArchive(archiveNames.firefox);
const firefoxSource = readArchive(archiveNames.firefoxSource);
const chromiumManifest = readArchiveJson(chromium, 'manifest.json');
const firefoxManifest = readArchiveJson(firefox, 'manifest.json');
const sourcePackageJson = readArchiveJson(firefoxSource, 'package.json');

assert(chromiumManifest.version === packageJson.version, 'Chromium ZIP 版本不一致。');
assert(chromiumManifest.minimum_chrome_version === '102', 'Chromium ZIP 最低版本不一致。');
assert(!chromiumManifest.browser_specific_settings, 'Chromium ZIP 不应包含 Gecko 设置。');
assert(firefoxManifest.version === packageJson.version, 'Firefox ZIP 版本不一致。');
assert(!firefoxManifest.minimum_chrome_version, 'Firefox ZIP 不应包含 Chromium 最低版本。');
assert(
  firefoxManifest.browser_specific_settings?.gecko?.id
    === 'ba-click-fx-extension@cialloking.top',
  'Firefox ZIP Gecko ID 不一致。',
);
assert(
  firefoxManifest.browser_specific_settings?.gecko?.strict_min_version === '140.0',
  'Firefox ZIP 最低桌面版本不一致。',
);
assert(
  firefoxManifest.browser_specific_settings?.gecko_android?.strict_min_version === '142.0',
  'Firefox ZIP 最低 Android 版本声明不一致。',
);
assert(
  JSON.stringify(
    firefoxManifest.browser_specific_settings?.gecko?.data_collection_permissions?.required,
  ) === JSON.stringify(['none']),
  'Firefox ZIP 缺少不收集数据声明。',
);
assert(sourcePackageJson.version === packageJson.version, 'Firefox 源码包版本不一致。');
assert(firefoxSource.entries['SOURCE_BUILD.md'], 'Firefox 源码包缺少构建说明。');
const sourceBuildInstructions = strFromU8(firefoxSource.entries['SOURCE_BUILD.md'])
  .replace(/^\uFEFF/, '');

assert(
  sourceBuildInstructions.includes(`v${packageJson.version}`),
  'Firefox 源码包构建说明中的版本不一致。',
);
assert(
  sourceBuildInstructions.includes(`release/${archiveNames.firefox}`),
  'Firefox 源码包构建说明中的输出文件名不一致。',
);
assert(firefoxSource.entries['src/content.js'], 'Firefox 源码包缺少内容脚本源码。');
assert(!firefoxSource.entries['dist-firefox/content.js'], 'Firefox 源码包不应包含构建产物。');

const expectedMetadata =
[
  ['chromiumPackage', 'chromiumSha256', archiveNames.chromium, chromium.sha256],
  ['firefoxPackage', 'firefoxSha256', archiveNames.firefox, firefox.sha256],
  ['firefoxSourcePackage', 'firefoxSourceSha256', archiveNames.firefoxSource, firefoxSource.sha256],
];

for (const [field, shaField, archiveName, sha256] of expectedMetadata)
{
  assert(
    metadata[field] === `release/${archiveName}`,
    `商店元数据中的 ${field} 文件名不一致。`,
  );
  assert(
    metadata[shaField] === sha256,
    `商店元数据中的 ${field} SHA-256 不一致：${sha256}`,
  );
}

const checksumsPath = join(rootDir, 'release', 'SHA256SUMS.txt');

assert(existsSync(checksumsPath), '缺少 SHA256SUMS.txt。');

const checksums = readFileSync(checksumsPath, 'utf8').replace(/^\uFEFF/, '');

for (const [field, _shaField, archiveName, sha256] of expectedMetadata)
{
  assert(
    checksums.includes(`${sha256}  ${archiveName}`),
    `SHA256SUMS.txt 缺少 ${field}。`,
  );
}

console.log(`发布标签 ${tag}、双浏览器包、源码包与全部哈希一致。`);
