import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { strFromU8, unzipSync, zipSync } from 'fflate';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const releaseDir = join(rootDir, 'release');
const ARCHIVE_MTIME = new Date(1980, 0, 1, 0, 0, 0);

function readJson(path)
{
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function collectFiles(directory)
{
  const files = {};
  const entries = readdirSync(directory, { withFileTypes: true })
    .sort((left, right) =>
    {
      if (left.name === right.name)
      {
        return 0;
      }

      return left.name < right.name ? -1 : 1;
    });

  for (const entry of entries)
  {
    const path = join(directory, entry.name);

    if (entry.isDirectory())
    {
      Object.assign(files, collectFiles(path));
    }
    else if (entry.isFile())
    {
      const archivePath = relative(distDir, path).split(sep).join('/');

      files[archivePath] = new Uint8Array(readFileSync(path));
    }
  }

  return files;
}

function assert(condition, message)
{
  if (!condition)
  {
    throw new Error(message);
  }
}

assert(statSync(distDir).isDirectory(), '请先执行 npm run build。');

const packageJson = readJson(join(rootDir, 'package.json'));
const manifest = readJson(join(distDir, 'manifest.json'));

assert(packageJson.version === manifest.version, 'package.json 与 Manifest 版本不一致。');

const archiveName = `ba-click-fx-extension-v${manifest.version}-chromium.zip`;
const archivePath = join(releaseDir, archiveName);
const archiveBytes = zipSync(collectFiles(distDir), {
  level: 9,
  // 固定时间戳，使本地、CI 与 Release 对同一构建产生相同哈希。
  mtime: ARCHIVE_MTIME,
});

mkdirSync(releaseDir, { recursive: true });
writeFileSync(archivePath, archiveBytes);

const unpacked = unzipSync(archiveBytes);
const entryNames = Object.keys(unpacked);

assert(entryNames.includes('manifest.json'), 'ZIP 根目录缺少 manifest.json。');
assert(!entryNames.some((name) => name.startsWith('dist/')), 'ZIP 不应包含额外的 dist 目录层级。');

const zippedManifest = JSON.parse(strFromU8(unpacked['manifest.json']).replace(/^\uFEFF/, ''));

assert(zippedManifest.version === manifest.version, 'ZIP 中 Manifest 版本不一致。');

const sha256 = createHash('sha256').update(archiveBytes).digest('hex').toUpperCase();

console.log(`Chromium 发布包：${archivePath}`);
console.log(`文件数量：${entryNames.length}`);
console.log(`SHA-256：${sha256}`);
