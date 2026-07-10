import { build } from 'esbuild';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.svg',
  '.txt',
]);

function assertSafeDistPath()
{
  const relativePath = relative(rootDir, distDir);

  if (!relativePath || relativePath.startsWith('..') || relativePath.includes(':'))
  {
    throw new Error(`拒绝清理工作区之外的输出目录：${distDir}`);
  }
}

function copyTextAsset(source, destination)
{
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function walkFiles(directory)
{
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true }))
  {
    const path = join(directory, entry.name);

    if (entry.isDirectory())
    {
      files.push(...walkFiles(path));
    }
    else if (entry.isFile())
    {
      files.push(path);
    }
  }

  return files;
}

function ensureDistBom()
{
  for (const path of walkFiles(distDir))
  {
    if (!TEXT_EXTENSIONS.has(extname(path).toLowerCase()))
    {
      continue;
    }

    const content = readFileSync(path);

    if (
      content.length >= UTF8_BOM.length &&
      content.subarray(0, UTF8_BOM.length).equals(UTF8_BOM)
    )
    {
      continue;
    }

    writeFileSync(path, Buffer.concat([UTF8_BOM, content]));
  }
}

assertSafeDistPath();
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build(
{
  entryPoints:
  {
    content: join(rootDir, 'src', 'content.js'),
    'popup/popup': join(rootDir, 'src', 'popup', 'popup.js'),
  },
  outdir: distDir,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome102', 'edge102'],
  charset: 'utf8',
  legalComments: 'none',
  minify: false,
  sourcemap: false,
  logLevel: 'info',
});

copyTextAsset(join(rootDir, 'manifest.json'), join(distDir, 'manifest.json'));
copyTextAsset(
  join(rootDir, 'src', 'popup', 'popup.html'),
  join(distDir, 'popup', 'popup.html'),
);
copyTextAsset(
  join(rootDir, 'src', 'popup', 'popup.css'),
  join(distDir, 'popup', 'popup.css'),
);

if (existsSync(join(rootDir, 'icons')))
{
  cpSync(join(rootDir, 'icons'), join(distDir, 'icons'), { recursive: true });
}

for (const fileName of ['LICENSE', 'THIRD_PARTY_NOTICES.md'])
{
  const source = join(rootDir, fileName);

  if (existsSync(source) && statSync(source).isFile())
  {
    copyTextAsset(source, join(distDir, fileName));
  }
}

ensureDistBom();

console.log(`扩展已构建到 ${distDir}`);
