import {
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const writeMode = process.argv.includes('--write');
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const decoder = new TextDecoder('utf-8', { fatal: true });
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'release',
]);
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.svg',
  '.txt',
  '.yml',
  '.yaml',
]);
const TEXT_FILE_NAMES = new Set([
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  'LICENSE',
]);

function isTextFile(path)
{
  return TEXT_FILE_NAMES.has(basename(path)) || TEXT_EXTENSIONS.has(extname(path).toLowerCase());
}

function walk(directory)
{
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true }))
  {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name))
    {
      continue;
    }

    const path = join(directory, entry.name);

    if (entry.isDirectory())
    {
      files.push(...walk(path));
    }
    else if (entry.isFile() && isTextFile(path))
    {
      files.push(path);
    }
  }

  return files;
}

function hasBom(content)
{
  return content.length >= 3 && content.subarray(0, 3).equals(UTF8_BOM);
}

function stripLeadingBom(content)
{
  let offset = 0;

  while (
    content.length >= offset + UTF8_BOM.length &&
    content.subarray(offset, offset + UTF8_BOM.length).equals(UTF8_BOM)
  )
  {
    offset += UTF8_BOM.length;
  }

  return content.subarray(offset);
}

const failures = [];
let changed = 0;

for (const path of walk(rootDir))
{
  let content = readFileSync(path);

  if (writeMode)
  {
    const payload = stripLeadingBom(content);
    const text = decoder.decode(payload).replace(/\r\n?/g, '\n');
    const normalized = Buffer.concat([UTF8_BOM, Buffer.from(text, 'utf8')]);

    if (!content.equals(normalized))
    {
      content = normalized;
      writeFileSync(path, content);
      changed++;
    }
  }

  if (!hasBom(content))
  {
    failures.push(`${path}: 缺少 UTF-8 BOM`);
    continue;
  }

  if (hasBom(content.subarray(UTF8_BOM.length)))
  {
    failures.push(`${path}: 包含重复的 UTF-8 BOM`);
    continue;
  }

  try
  {
    const text = decoder.decode(content.subarray(UTF8_BOM.length));

    if (text.includes('\r'))
    {
      failures.push(`${path}: 换行符不是 LF`);
    }
  }
  catch
  {
    failures.push(`${path}: 不是有效的 UTF-8 文本`);
  }
}

if (failures.length > 0)
{
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
else if (writeMode)
{
  console.log(`已将 ${changed} 个文本文件规范为 UTF-8 BOM 与 LF。`);
}
else
{
  console.log('所有文本文件均为有效的 UTF-8 BOM 编码。');
}
