import assert from 'node:assert/strict';
import test from 'node:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  mergeObjects,
  parseTarget,
  readJson,
} from '../scripts/targets.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('构建目标默认保持 Chromium 并允许显式选择 Firefox', () =>
{
  assert.equal(parseTarget([]).name, 'chromium');
  assert.equal(parseTarget(['--target', 'firefox']).distDirectory, 'dist-firefox');
  assert.equal(parseTarget(['--target=firefox']).archiveSuffix, 'firefox');
  assert.throws(() => parseTarget(['--target', 'safari']), /未知构建目标/);
});

test('Manifest 目标覆盖会深合并对象但完整替换数组', () =>
{
  const merged = mergeObjects(
  {
    permissions: ['storage'],
    nested:
    {
      shared: true,
      values: ['base'],
    },
  },
  {
    permissions: ['activeTab'],
    nested:
    {
      target: true,
      values: ['overlay'],
    },
  });

  assert.deepEqual(merged,
  {
    permissions: ['activeTab'],
    nested:
    {
      shared: true,
      target: true,
      values: ['overlay'],
    },
  });
});

test('Firefox Manifest 覆盖固定 AMO 身份和无数据收集声明', () =>
{
  const overlay = readJson(join(rootDir, 'manifests', 'firefox.json'));

  assert.equal(
    overlay.browser_specific_settings.gecko.id,
    'ba-click-fx-extension@cialloking.top',
  );
  assert.equal(overlay.browser_specific_settings.gecko.strict_min_version, '140.0');
  assert.deepEqual(
    overlay.browser_specific_settings.gecko.data_collection_permissions.required,
    ['none'],
  );
  assert.equal(
    overlay.browser_specific_settings.gecko_android.strict_min_version,
    '142.0',
  );
});
