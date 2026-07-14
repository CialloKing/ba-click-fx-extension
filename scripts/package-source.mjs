import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { zipSync } from 'fflate';

import { readJson } from './targets.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = join(rootDir, 'release');
const ARCHIVE_MTIME = new Date(1980, 0, 1, 0, 0, 0);
const SOURCE_DIRECTORIES = [
  '_locales',
  'assets',
  'icons',
  'manifests',
  'scripts',
  'src',
  'test',
];
const SOURCE_FILES = [
  'CHANGELOG.md',
  'LICENSE',
  'manifest.json',
  'package-lock.json',
  'package.json',
  'PRIVACY.md',
  'README.md',
  'SECURITY.md',
  'SOURCE_BUILD.md',
  'THIRD_PARTY_NOTICES.md',
];

function assert(condition, message)
{
  if (!condition)
  {
    throw new Error(message);
  }
}

function collectPath(path, files)
{
  const stats = statSync(path);

  if (stats.isDirectory())
  {
    const entries = readdirSync(path, { withFileTypes: true })
      .sort((left, right) =>
      {
        if (left.name === right.name)
        {
          return 0;
        }

        // 只比较代码点，避免操作系统 ICU/区域设置改变源码包顺序和哈希。
        return left.name < right.name ? -1 : 1;
      });

    for (const entry of entries)
    {
      collectPath(join(path, entry.name), files);
    }

    return;
  }

  if (!stats.isFile())
  {
    return;
  }

  const archivePath = relative(rootDir, path).split(sep).join('/');

  files[archivePath] = new Uint8Array(readFileSync(path));
}

const packageJson = readJson(join(rootDir, 'package.json'));
const files = {};

for (const relativePath of [...SOURCE_DIRECTORIES, ...SOURCE_FILES])
{
  const path = join(rootDir, relativePath);

  assert(existsSync(path), `Firefox 源码包缺少 ${relativePath}。`);
  collectPath(path, files);
}

// 源码包使用白名单，避免把构建产物、凭据或本地工具缓存交给审核员。
const archiveName = `ba-click-fx-extension-v${packageJson.version}-firefox-source.zip`;
const archivePath = join(releaseDir, archiveName);
const archiveBytes = zipSync(files,
{
  level: 9,
  mtime: ARCHIVE_MTIME,
});

mkdirSync(releaseDir, { recursive: true });
writeFileSync(archivePath, archiveBytes);

const sha256 = createHash('sha256').update(archiveBytes).digest('hex').toUpperCase();

console.log(`Firefox 源码包：${archivePath}`);
console.log(`文件数量：${Object.keys(files).length}`);
console.log(`SHA-256：${sha256}`);
