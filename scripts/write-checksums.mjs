import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './targets.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = join(rootDir, 'release');
const packageJson = readJson(join(rootDir, 'package.json'));
const archiveNames = [
  `ba-click-fx-extension-v${packageJson.version}-chromium.zip`,
  `ba-click-fx-extension-v${packageJson.version}-firefox.zip`,
  `ba-click-fx-extension-v${packageJson.version}-firefox-source.zip`,
];
const lines = [];

for (const archiveName of archiveNames)
{
  const archivePath = join(releaseDir, archiveName);

  if (!existsSync(archivePath))
  {
    throw new Error(`缺少待计算哈希的发布包：${archiveName}`);
  }

  const sha256 = createHash('sha256')
    .update(readFileSync(archivePath))
    .digest('hex')
    .toUpperCase();

  lines.push(`${sha256}  ${archiveName}`);
}

const UTF8_BOM = '\uFEFF';
const checksumsPath = join(releaseDir, 'SHA256SUMS.txt');

writeFileSync(checksumsPath, `${UTF8_BOM}${lines.join('\n')}\n`, 'utf8');
console.log(`发布包哈希：${checksumsPath}`);
