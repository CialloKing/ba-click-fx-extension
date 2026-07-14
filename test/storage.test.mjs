import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyStorageChanges,
  loadStorageState,
  removeLegacyDisabledSites,
  writeSettingsPatch,
} from '../src/shared/storage.js';
import { normalizeSettings } from '../src/shared/settings.js';

function createStorageMock(initial = {})
{
  const records =
  {
    sync: { ...(initial.sync || {}) },
    local: { ...(initial.local || {}) },
  };
  const createArea = (areaName) =>
  ({
    get(keys, callback)
    {
      const result = {};
      const source = records[areaName];

      for (const key of Array.isArray(keys) ? keys : Object.keys(keys || {}))
      {
        if (Object.hasOwn(source, key))
        {
          result[key] = source[key];
        }
        else if (!Array.isArray(keys))
        {
          result[key] = keys[key];
        }
      }

      callback(result);
    },
    set(values, callback)
    {
      Object.assign(records[areaName], values);
      callback();
    },
    remove(keys, callback)
    {
      for (const key of Array.isArray(keys) ? keys : [keys])
      {
        delete records[areaName][key];
      }

      callback();
    },
  });

  return {
    records,
    chromeApi:
    {
      runtime:
      {
        lastError: null,
      },
      storage:
      {
        sync: createArea('sync'),
        local: createArea('local'),
      },
    },
  };
}

test('schema v2 会把旧同步站点规则幂等合并到本机且保留旧副本', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      color: '#8edcff',
      disabledSites:
      {
        'https://sync.example': true,
      },
    },
    local:
    {
      disabledSites:
      {
        'https://local.example': true,
      },
      storageSchemaVersion: 1,
    },
  });

  const first = await loadStorageState(mock.chromeApi);
  const second = await loadStorageState(mock.chromeApi);

  assert.deepEqual(first.settings.disabledSites,
  {
    'https://local.example': true,
    'https://sync.example': true,
  });
  assert.deepEqual(second.settings.disabledSites, first.settings.disabledSites);
  assert.equal(first.hasLegacyDisabledSites, true);
  assert.equal(mock.records.local.storageSchemaVersion, 2);
  assert.deepEqual(mock.records.sync.disabledSites,
  {
    'https://sync.example': true,
  });
});

test('视觉偏好写入 sync，网站规则只写入 local', async () =>
{
  const mock = createStorageMock();

  await writeSettingsPatch(
  {
    color: '#8edcff',
    disabledSites:
    {
      'https://example.com': true,
    },
  }, mock.chromeApi);

  assert.equal(mock.records.sync.color, '#8edcff');
  assert.equal(Object.hasOwn(mock.records.sync, 'disabledSites'), false);
  assert.deepEqual(mock.records.local.disabledSites,
  {
    'https://example.com': true,
  });
});

test('显式清理只删除旧同步副本，不影响已经迁移的本机规则', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      disabledSites:
      {
        'https://example.com': true,
      },
    },
    local:
    {
      disabledSites:
      {
        'https://example.com': true,
      },
      storageSchemaVersion: 2,
    },
  });

  await removeLegacyDisabledSites(mock.chromeApi);

  assert.equal(Object.hasOwn(mock.records.sync, 'disabledSites'), false);
  assert.deepEqual(mock.records.local.disabledSites,
  {
    'https://example.com': true,
  });
});

test('500 条本机规则可读取，sync 与 local 变更分别应用', async () =>
{
  const disabledSites = Object.fromEntries(
    Array.from({ length: 500 }, (_, index) => [`https://site-${index}.example`, true]),
  );
  const mock = createStorageMock(
  {
    local:
    {
      disabledSites,
      storageSchemaVersion: 2,
    },
  });
  const state = await loadStorageState(mock.chromeApi);
  const syncChanged = applyStorageChanges(state.settings,
  {
    opacity: { newValue: 0.7 },
  }, 'sync');
  const localChanged = applyStorageChanges(syncChanged,
  {
    disabledSites:
    {
      newValue:
      {
        'https://only-local.example': true,
      },
    },
  }, 'local');

  assert.equal(Object.keys(state.settings.disabledSites).length, 500);
  assert.equal(syncChanged.opacity, 0.7);
  assert.deepEqual(localChanged.disabledSites,
  {
    'https://only-local.example': true,
  });
  assert.equal(
    applyStorageChanges(normalizeSettings(), { ignored: { newValue: true } }, 'local')
      .enabled,
    true,
  );
});
