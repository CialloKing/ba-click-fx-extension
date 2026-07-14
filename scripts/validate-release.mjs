import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf8').replace(/^\uFEFF/, ''),
);
const manifest = JSON.parse(
  readFileSync(join(rootDir, 'manifest.json'), 'utf8').replace(/^\uFEFF/, ''),
);
const changelog = readFileSync(join(rootDir, 'CHANGELOG.md'), 'utf8').replace(/^\uFEFF/, '');
const metadata = JSON.parse(
  readFileSync(join(rootDir, 'store-submission', 'metadata.json'), 'utf8')
    .replace(/^\uFEFF/, ''),
);
const tag = process.argv[2] || process.env.GITHUB_REF_NAME;
const archiveName = `ba-click-fx-extension-v${packageJson.version}-chromium.zip`;
const archivePath = join(rootDir, 'release', archiveName);

function assert(condition, message)
{
  if (!condition)
  {
    throw new Error(message);
  }
}

assert(tag, '缺少待发布的 Git 标签。');
assert(tag === `v${packageJson.version}`, `标签 ${tag} 与 package.json 版本不一致。`);
assert(manifest.version === packageJson.version, 'Manifest 与 package.json 版本不一致。');
assert(
  changelog.includes(`## [${packageJson.version}]`),
  `CHANGELOG.md 缺少 ${packageJson.version} 正式版本记录。`,
);
assert(tag !== 'v1.0.4', 'v1.0.4 已保留并明确不发布。');
assert(existsSync(archivePath), `缺少发布包 ${archiveName}。`);

const archiveSha256 = createHash('sha256')
  .update(readFileSync(archivePath))
  .digest('hex')
  .toUpperCase();

assert(
  metadata.chromiumPackage === `release/${archiveName}`,
  '商店元数据中的发布包名称不一致。',
);
assert(
  metadata.chromiumSha256 === archiveSha256,
  `商店元数据中的 SHA-256 与发布包不一致：${archiveSha256}`,
);

console.log(`发布标签 ${tag}、扩展版本与包哈希一致。`);
