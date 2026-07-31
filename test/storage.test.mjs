import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyStorageChanges,
  createSettingsWriteQueue,
  loadStorageState,
  removeLegacyDisabledSites,
  writeSettingsPatch,
} from '../src/shared/storage.js';
import {
  STORAGE_SCHEMA_VERSION,
  getQualitySettingsPatch,
  normalizeSettings,
} from '../src/shared/settings.js';

function createStorageMock(initial = {}, options = {})
{
  const records =
  {
    sync: { ...(initial.sync || {}) },
    local: { ...(initial.local || {}) },
  };
  const setCalls =
  {
    sync: [],
    local: [],
  };
  const runtime =
  {
    lastError: null,
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
      setCalls[areaName].push({ ...values });

      if (options.failSetArea === areaName)
      {
        runtime.lastError = { message: `${areaName} 写入失败` };
        callback();
        runtime.lastError = null;
        return;
      }

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
    setCalls,
    chromeApi:
    {
      runtime,
      storage:
      {
        sync: createArea('sync'),
        local: createArea('local'),
      },
    },
  };
}

function createDeferred()
{
  let resolve;

  const promise = new Promise((fulfill) =>
  {
    resolve = fulfill;
  });

  return { promise, resolve };
}

test('设置写入队列等待前一项完成并保持提交顺序', async () =>
{
  const firstGate = createDeferred();
  const secondGate = createDeferred();
  const events = [];
  const queueWrite = createSettingsWriteQueue(async ({ id }) =>
  {
    events.push(`start:${id}`);
    await (id === 1 ? firstGate.promise : secondGate.promise);
    events.push(`finish:${id}`);
  });
  const first = queueWrite({ id: 1 });
  const second = queueWrite({ id: 2 });

  await Promise.resolve();
  assert.deepEqual(events, ['start:1']);

  firstGate.resolve();
  await first;
  await Promise.resolve();
  assert.deepEqual(events, ['start:1', 'finish:1', 'start:2']);

  secondGate.resolve();
  await second;
  assert.deepEqual(events, ['start:1', 'finish:1', 'start:2', 'finish:2']);
});

test('设置写入队列在前一项失败后继续执行下一项', async () =>
{
  const firstGate = createDeferred();
  const started = [];
  const queueWrite = createSettingsWriteQueue(async ({ id }) =>
  {
    started.push(id);

    if (id === 1)
    {
      await firstGate.promise;
      throw new Error('first failed');
    }
  });
  const first = queueWrite({ id: 1 });
  const second = queueWrite({ id: 2 });

  await Promise.resolve();
  assert.deepEqual(started, [1]);

  firstGate.resolve();
  await assert.rejects(first, /first failed/);
  await second;
  assert.deepEqual(started, [1, 2]);
});

test('旧同步站点规则幂等合并到本机且保留旧副本', async () =>
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
  assert.equal(mock.records.local.storageSchemaVersion, STORAGE_SCHEMA_VERSION);
  assert.deepEqual(mock.records.sync.disabledSites,
  {
    'https://sync.example': true,
  });
});

test('schema v5 原子持久化旧版默认值、渲染配置和参数版本', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      preset: 'classic',
      color: '#69a1ff',
      opacity: 0.5,
      scale: 1.1,
      quality: 'balanced',
      disabledSites:
      {
        'https://legacy.example': true,
      },
    },
    local:
    {
      disabledSites: {},
      storageSchemaVersion: 2,
    },
  });

  const migrated = await loadStorageState(mock.chromeApi);

  assert.equal(migrated.settings.opacity, 1);
  assert.equal(migrated.settings.scale, 1);
  assert.equal(migrated.settings.quality, 'ultra');
  assert.equal(migrated.settings.trailAlways, false);
  assert.equal(mock.records.sync.opacity, 1);
  assert.equal(mock.records.sync.scale, 1);
  assert.equal(mock.records.sync.quality, 'ultra');
  assert.equal(mock.records.sync.trailAlways, false);
  assert.equal(mock.setCalls.sync.length, 1);
  assert.deepEqual(mock.setCalls.sync[0],
  {
    color: '#4ca7ff',
    opacity: 1,
    scale: 1,
    quality: 'ultra',
    preset: 'classic',
    trailAlways: false,
    renderMode: 'full-webgl2',
    maxDpr: 2,
    fxParams: {},
    fxParamSchemaVersion: 1,
  });
  // v2 已处理过站点规则，v3 不应把保留的旧副本重新合并回来。
  assert.deepEqual(migrated.settings.disabledSites, {});

  const idempotent = await loadStorageState(mock.chromeApi);

  assert.deepEqual(idempotent.settings, migrated.settings);
  assert.equal(mock.setCalls.sync.length, 1);

  await writeSettingsPatch(
  {
    ...getQualitySettingsPatch('high'),
    preset: 'custom',
  }, mock.chromeApi);

  const reloaded = await loadStorageState(mock.chromeApi);

  assert.equal(reloaded.settings.opacity, 1);
  assert.equal(reloaded.settings.scale, 1);
  assert.equal(reloaded.settings.quality, 'high');
  assert.equal(reloaded.settings.trailAlways, false);
  assert.equal(mock.setCalls.sync.length, 2);
  assert.equal(mock.records.local.storageSchemaVersion, STORAGE_SCHEMA_VERSION);
});

test('schema v5 保留旧版记录中显式选择的常显拖尾', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      preset: 'classic',
      color: '#69a1ff',
      opacity: 0.5,
      scale: 1.1,
      quality: 'balanced',
      trailAlways: true,
    },
    local:
    {
      storageSchemaVersion: 2,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.opacity, 1);
  assert.equal(state.settings.scale, 1);
  assert.equal(state.settings.quality, 'ultra');
  assert.equal(state.settings.trailAlways, true);
  assert.equal(mock.records.sync.trailAlways, true);
  assert.equal(Object.hasOwn(mock.setCalls.sync[0], 'trailAlways'), false);
});

test('参数 Schema 0 迁移与拒绝报告在一次同步写入中完成', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      quality: 'ultra',
      renderMode: 'webgl2-bloom',
      maxDpr: 2,
      fxParams:
      {
        'bloom.scatter': 0.35,
        'bloom.trailEmissionAlpha': 0.5,
        rootDurationMs: 1500,
      },
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });

  const migrated = await loadStorageState(mock.chromeApi);

  assert.deepEqual(migrated.settings.fxParams,
  {
    'bloom.diffusion': 7,
    'bloom.trailEmissionAlpha': 0.5,
    'bloom.trailAlpha': 0.09,
  });
  assert.equal(migrated.settings.fxParamSchemaVersion, 1);
  assert.equal(
    migrated.fxParamMigrationReport.normalized.some(({ reason }) => reason === 'renamed'),
    true,
  );
  assert.deepEqual(migrated.fxParamMigrationReport.rejected,
  [{
    path: 'rootDurationMs',
    value: 1500,
    reason: 'deprecated-path',
  }]);
  assert.deepEqual(mock.setCalls.sync,
  [{
    fxParams:
    {
      'bloom.diffusion': 7,
      'bloom.trailEmissionAlpha': 0.5,
      'bloom.trailAlpha': 0.09,
    },
    fxParamSchemaVersion: 1,
  }]);

  await loadStorageState(mock.chromeApi);
  assert.equal(mock.setCalls.sync.length, 1);
});

test('schema v5 不改写用户自定义外观参数', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      preset: 'custom',
      color: '#69a1ff',
      opacity: 0.5,
      scale: 1.1,
      quality: 'balanced',
    },
    local:
    {
      storageSchemaVersion: 2,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.opacity, 0.5);
  assert.equal(state.settings.scale, 1.1);
  assert.equal(state.settings.quality, 'balanced');
  assert.equal(state.settings.preset, 'custom');
  assert.equal(mock.setCalls.sync.length, 1);
  assert.deepEqual(mock.setCalls.sync[0],
  {
    renderMode: 'legacy',
    maxDpr: 1,
    fxParams: {},
    fxParamSchemaVersion: 1,
  });
});

test('schema v5 同步迁移失败时不会提前推进本机版本', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      preset: 'classic',
      color: '#69a1ff',
      opacity: 0.5,
      scale: 1.1,
      quality: 'balanced',
    },
    local:
    {
      storageSchemaVersion: 2,
    },
  }, { failSetArea: 'sync' });

  await assert.rejects(
    loadStorageState(mock.chromeApi),
    /sync 写入失败/,
  );

  assert.equal(mock.records.sync.opacity, 0.5);
  assert.equal(mock.records.local.storageSchemaVersion, 2);
  assert.equal(mock.setCalls.local.length, 0);
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

test('1.2.17 透明合同字段原子写入并可重新读取', async () =>
{
  const mock = createStorageMock();
  const patch =
  {
    outputCompositing: 'browser-overlay',
    overlayAlphaPolicy: 'visual-max',
    overlayColorCompensation: 'bright-core',
    overlayAlphaLimit: 0.7,
    hostCompositing: 'plus-lighter',
  };

  await writeSettingsPatch(patch, mock.chromeApi);

  assert.deepEqual(mock.setCalls.sync, [patch]);
  const state = await loadStorageState(mock.chromeApi);

  for (const [key, value] of Object.entries(patch))
  {
    assert.equal(state.settings[key], value);
  }
});

test('自定义渲染组合将画质、模式与 DPR 原子写入 sync', async () =>
{
  const mock = createStorageMock();

  await writeSettingsPatch(
  {
    quality: 'custom',
    renderMode: 'software-bloom',
    maxDpr: 3,
    preset: 'custom',
  }, mock.chromeApi);

  assert.deepEqual(mock.setCalls.sync,
  [{
    quality: 'custom',
    renderMode: 'software-bloom',
    maxDpr: 3,
    preset: 'custom',
  }]);
});

test('高级特效参数与 Schema 版本原子写入 sync', async () =>
{
  const mock = createStorageMock();

  await assert.rejects(
    writeSettingsPatch(
    {
      fxParams:
      {
        'rings.radiusMin': 80,
        'rings.unknown': 1,
      },
    }, mock.chromeApi),
    /rings\.unknown: unknown-path/,
  );
  assert.equal(mock.setCalls.sync.length, 0);

  await writeSettingsPatch(
  {
    fxParams:
    {
      'rings.radiusMin': 80,
      'hit.enabled': true,
    },
  }, mock.chromeApi);

  assert.deepEqual(mock.records.sync.fxParams,
  {
    'rings.radiusMin': 80,
    'hit.enabled': true,
  });
  assert.equal(mock.records.sync.fxParamSchemaVersion, 1);
  assert.deepEqual(mock.setCalls.sync,
  [{
    fxParams:
    {
      'rings.radiusMin': 80,
      'hit.enabled': true,
    },
    fxParamSchemaVersion: 1,
  }]);
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
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
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
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
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

test('旧设备只同步 quality 时当前页与重新加载均保持档位', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      quality: 'ultra',
      renderMode: 'webgl2-bloom',
      maxDpr: 2,
      fxParamSchemaVersion: 1,
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });
  const changes =
  {
    quality: { newValue: 'balanced' },
  };
  const changed = applyStorageChanges(normalizeSettings(), changes, 'sync');

  mock.records.sync.quality = 'balanced';
  const reloaded = await loadStorageState(mock.chromeApi);

  assert.equal(changed.quality, 'balanced');
  assert.equal(changed.renderMode, 'legacy');
  assert.equal(changed.maxDpr, 1);
  assert.equal(reloaded.settings.quality, 'balanced');
  assert.equal(reloaded.settings.renderMode, 'legacy');
  assert.equal(reloaded.settings.maxDpr, 1);
  assert.equal(mock.setCalls.sync.length, 0);
});

test('旧最高画质映射在读取时切换到完整 WebGL2', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      quality: 'ultra',
      renderMode: 'webgl2-bloom',
      maxDpr: 2,
      fxParamSchemaVersion: 1,
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.quality, 'ultra');
  assert.equal(state.settings.renderMode, 'full-webgl2');
  assert.equal(state.settings.maxDpr, 2);
  assert.equal(mock.setCalls.sync.length, 0);
});

test('读取时修复旧设备留下的画质与渲染组合不一致', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      quality: 'balanced',
      renderMode: 'webgl2-bloom',
      maxDpr: 2,
      fxParamSchemaVersion: 1,
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.quality, 'balanced');
  assert.equal(state.settings.renderMode, 'legacy');
  assert.equal(state.settings.maxDpr, 1);
  assert.equal(mock.setCalls.sync.length, 0);
});

test('参数增量事件只在可证明为旧 Schema 时迁移', () =>
{
  const current = normalizeSettings(
  {
    fxParams: {},
    fxParamSchemaVersion: 1,
  });
  const ambiguous = applyStorageChanges(current,
  {
    fxParams:
    {
      newValue:
      {
        'bloom.trailEmissionAlpha': 0.5,
      },
    },
  }, 'sync');
  const legacyByScatter = applyStorageChanges(current,
  {
    fxParams:
    {
      newValue:
      {
        'bloom.scatter': 0.35,
        'bloom.trailEmissionAlpha': 0.5,
      },
    },
  }, 'sync');
  const legacyByMetadata = applyStorageChanges(current,
  {
    fxParams:
    {
      newValue:
      {
        rootDurationMs: 1500,
        'bloom.trailEmissionAlpha': 0.5,
      },
    },
  }, 'sync');
  const explicitLegacy = applyStorageChanges(current,
  {
    fxParams:
    {
      newValue:
      {
        'bloom.trailEmissionAlpha': 0.5,
      },
    },
    fxParamSchemaVersion: { newValue: 0 },
  }, 'sync');

  assert.deepEqual(ambiguous.fxParams,
  {
    'bloom.trailEmissionAlpha': 0.5,
  });
  assert.equal(legacyByScatter.fxParams['bloom.diffusion'], 7);
  assert.equal(legacyByScatter.fxParams['bloom.trailAlpha'], 0.09);
  assert.equal(legacyByMetadata.fxParams['bloom.trailAlpha'], 0.09);
  assert.equal(explicitLegacy.fxParams['bloom.trailAlpha'], 0.09);
});
