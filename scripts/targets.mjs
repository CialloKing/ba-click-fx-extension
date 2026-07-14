import { readFileSync } from 'node:fs';

export const TARGETS = Object.freeze(
{
  chromium: Object.freeze(
  {
    archiveSuffix: 'chromium',
    distDirectory: 'dist',
    displayName: 'Chromium',
    esbuildTargets: Object.freeze(['chrome102', 'edge102']),
    manifestOverlay: 'manifests/chromium.json',
  }),
  firefox: Object.freeze(
  {
    archiveSuffix: 'firefox',
    distDirectory: 'dist-firefox',
    displayName: 'Firefox',
    esbuildTargets: Object.freeze(['firefox140']),
    manifestOverlay: 'manifests/firefox.json',
  }),
});

function isPlainObject(value)
{
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function readJson(path)
{
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

export function mergeObjects(base, overlay)
{
  const merged = { ...base };

  for (const [key, value] of Object.entries(overlay))
  {
    if (isPlainObject(value) && isPlainObject(merged[key]))
    {
      merged[key] = mergeObjects(merged[key], value);
    }
    else
    {
      // 数组和标量属于目标的完整声明，替换可以避免权限被意外拼接扩大。
      merged[key] = value;
    }
  }

  return merged;
}

export function parseTarget(argumentsList, defaultTarget = 'chromium')
{
  const targetArgumentIndex = argumentsList.indexOf('--target');
  const inlineArgument = argumentsList.find((value) => value.startsWith('--target='));
  const targetName = inlineArgument?.slice('--target='.length)
    || (targetArgumentIndex >= 0 ? argumentsList[targetArgumentIndex + 1] : null)
    || defaultTarget;
  const target = TARGETS[targetName];

  if (!target)
  {
    throw new Error(`未知构建目标：${targetName}`);
  }

  return {
    name: targetName,
    ...target,
  };
}
