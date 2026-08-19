import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyStorageChanges,
  createSettingsWriteQueue,
  loadStorageState,
  writeSettingsPatch,
} from '../src/shared/storage.js';
import {
  DEFAULT_SETTINGS,
  STORAGE_SCHEMA_VERSION,
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

test('空存储读取扩展 DOM Add 默认值', async () =>
{
  const mock = createStorageMock();
  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.outputCompositing, 'browser-overlay');
  assert.equal(state.settings.hostCompositing, 'screen');
  // 缺省值无需伪装成用户选择；只有参数 Schema 元数据需要迁移写回。
  assert.equal(Object.hasOwn(mock.records.sync, 'outputCompositing'), false);
  assert.equal(Object.hasOwn(mock.records.sync, 'hostCompositing'), false);
});

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

test('旧同步站点规则被忽略，只使用本机规则', async () =>
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

  const state = await loadStorageState(mock.chromeApi);

  assert.deepEqual(state.settings.disabledSites,
  {
    'https://local.example': true,
  });
  assert.equal(state.settings.color, '#8edcff');
  // 破坏性版本不做合并；版本标记一次性提升到当前值。
  assert.equal(mock.records.local.storageSchemaVersion, STORAGE_SCHEMA_VERSION);
  assert.equal(mock.setCalls.sync.length, 0);
});

test('读取时忽略旧 quality 并保留显式渲染配置', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      quality: 'balanced',
      renderMode: 'native-bloom',
      maxDpr: 2,
      fxParamSchemaVersion: 2,
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(Object.hasOwn(state.settings, 'quality'), false);
  assert.equal(state.settings.renderMode, 'native-bloom');
  assert.equal(state.settings.maxDpr, 2);
  assert.equal(state.settings.preset, 'custom');
  assert.equal(mock.setCalls.sync.length, 0);
});

test('旧 Schema 参数路径加载时直接丢弃，不再迁移写回', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
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

  const state = await loadStorageState(mock.chromeApi);

  // scatter 与 rootDurationMs 已非当前 Schema 路径；trailEmissionAlpha 保留。
  assert.deepEqual(state.settings.fxParams,
  {
    'bloom.trailEmissionAlpha': 0.5,
  });
  assert.equal(state.settings.fxParamSchemaVersion, 2);
  // 破坏性版本不做迁移写回。
  assert.equal(mock.setCalls.sync.length, 0);
});

test('已保存的有效参数原样读取，不再补齐圆角或写回', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      fxParams:
      {
        'rings.radiusMin': 80,
        'bloom.trailAlpha': 0.18,
      },
      fxParamSchemaVersion: 1,
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.deepEqual(state.settings.fxParams,
  {
    'rings.radiusMin': 80,
    'bloom.trailAlpha': 0.18,
  });
  assert.equal(state.settings.fxParamSchemaVersion, 2);
  // 破坏性版本不迁移、不写回。
  assert.equal(mock.setCalls.sync.length, 0);
});

test('存储的未来 Schema 版本被忽略，仅保留当前有效参数', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      fxParams:
      {
        'rings.radiusMin': 80,
        'shards.roundness': 0.4,
        'future.path': 1,
      },
      fxParamSchemaVersion: 99,
    },
    local:
    {
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(mock.setCalls.sync.length, 0);
  // 未来版本与未知路径被丢弃，有效参数保留，版本号归一到当前。
  assert.equal(state.settings.fxParamSchemaVersion, 2);
  assert.deepEqual(state.settings.fxParams,
  {
    'rings.radiusMin': 80,
    'shards.roundness': 0.4,
  });
});

test('写入时显式未来参数 Schema 版本被归一到当前版本', async () =>
{
  const mock = createStorageMock();

  await writeSettingsPatch(
  {
    fxParams:
    {
      'rings.radiusMin': 80,
    },
    fxParamSchemaVersion: 99,
  }, mock.chromeApi);

  assert.equal(mock.records.sync.fxParamSchemaVersion, 2);
  assert.deepEqual(mock.records.sync.fxParams,
  {
    'rings.radiusMin': 80,
  });
});

test('存储升级不改写用户自定义外观与渲染参数', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      preset: 'custom',
      color: '#69a1ff',
      opacity: 0.5,
      scale: 1.1,
      renderMode: 'software-bloom',
      maxDpr: 1,
      fxParamSchemaVersion: 2,
    },
    local:
    {
      storageSchemaVersion: 2,
    },
  });

  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.opacity, 0.5);
  assert.equal(state.settings.scale, 1.1);
  assert.equal(state.settings.renderMode, 'software-bloom');
  assert.equal(state.settings.maxDpr, 1);
  assert.equal(state.settings.preset, 'custom');
  assert.equal(mock.setCalls.sync.length, 0);
});

test('本机版本标记写入失败时读取失败且不推进版本', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      outputCompositing: 'browser-overlay',
      fxParamSchemaVersion: 2,
    },
    local:
    {
      storageSchemaVersion: 2,
    },
  }, { failSetArea: 'local' });

  await assert.rejects(
    loadStorageState(mock.chromeApi),
    /local 写入失败/,
  );

  assert.equal(mock.records.local.storageSchemaVersion, 2);
  assert.equal(mock.setCalls.sync.length, 0);
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

test('透明合同字段与 Screen 混合模式原子写入并可重新读取', async () =>
{
  const mock = createStorageMock();
  const patch =
  {
    outputCompositing: 'browser-overlay',
    overlayAlphaPolicy: 'visual-max',
    overlayColorCompensation: 'bright-core',
    overlayAlphaLimit: 0.7,
    hostCompositing: 'screen',
  };

  await writeSettingsPatch(patch, mock.chromeApi);

  assert.deepEqual(mock.setCalls.sync, [patch]);
  const state = await loadStorageState(mock.chromeApi);

  for (const [key, value] of Object.entries(patch))
  {
    assert.equal(state.settings[key], value);
  }
});

test('WebGPU HDR 展示设置原子写入并使用核心有效范围', async () =>
{
  const mock = createStorageMock();
  const patch =
  {
    renderMode: 'full-webgpu',
    webgpuHdrPeak: 3.5,
    webgpuHdrBrightness: 12,
    webgpuHdrColorPreservation: 0.75,
    webgpuHdrWhiteCore: 0.4,
    webgpuHdrWhiteStart: 6,
    webgpuHdrWhiteEnd: 4,
  };

  await writeSettingsPatch(patch, mock.chromeApi);

  assert.deepEqual(mock.setCalls.sync,
  [{
    ...patch,
    webgpuHdrWhiteEnd: 6.01,
  }]);
  const state = await loadStorageState(mock.chromeApi);

  assert.equal(state.settings.renderMode, 'full-webgpu');
  assert.equal(state.settings.webgpuHdrPeak, 3.5);
  assert.equal(state.settings.webgpuHdrBrightness, 12);
  assert.equal(state.settings.webgpuHdrColorPreservation, 0.75);
  assert.equal(state.settings.webgpuHdrWhiteCore, 0.4);
  assert.equal(state.settings.webgpuHdrWhiteStart, 6);
  assert.equal(state.settings.webgpuHdrWhiteEnd, 6.01);
});

test('自定义渲染组合将模式、DPR 与预设状态原子写入 sync', async () =>
{
  const mock = createStorageMock();

  await writeSettingsPatch(
  {
    renderMode: 'software-bloom',
    maxDpr: 3,
    preset: 'custom',
  }, mock.chromeApi);

  assert.deepEqual(mock.setCalls.sync,
  [{
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
  assert.equal(mock.records.sync.fxParamSchemaVersion, 2);
  assert.deepEqual(mock.setCalls.sync,
  [{
    fxParams:
    {
      'rings.radiusMin': 80,
      'hit.enabled': true,
    },
    fxParamSchemaVersion: 2,
  }]);
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

test('旧 quality 记录与增量事件均被忽略', async () =>
{
  const mock = createStorageMock(
  {
    sync:
    {
      quality: 'balanced',
      fxParamSchemaVersion: 2,
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
  const current = normalizeSettings(
  {
    renderMode: 'native-bloom',
    maxDpr: 2,
  });
  const changed = applyStorageChanges(current, changes, 'sync');
  const reloaded = await loadStorageState(mock.chromeApi);

  assert.equal(changed, current);
  assert.equal(Object.hasOwn(reloaded.settings, 'quality'), false);
  assert.equal(reloaded.settings.renderMode, DEFAULT_SETTINGS.renderMode);
  assert.equal(reloaded.settings.maxDpr, DEFAULT_SETTINGS.maxDpr);
  assert.equal(mock.setCalls.sync.length, 0);
});

test('参数增量事件统一按当前 Schema 归一化', () =>
{
  const current = normalizeSettings(
  {
    fxParams:
    {
      'rings.radiusMin': 80,
    },
  });
  const changed = applyStorageChanges(current,
  {
    fxParams:
    {
      newValue:
      {
        'rings.radiusMin': 90,
        'shards.roundness': 0.5,
        'bloom.scatter': 0.35,
      },
    },
    fxParamSchemaVersion: { newValue: 99 },
  }, 'sync');

  // scatter 非法被丢弃；有效路径应用；未来版本号归一到当前。
  assert.deepEqual(changed.fxParams,
  {
    'rings.radiusMin': 90,
    'shards.roundness': 0.5,
  });
  assert.equal(changed.fxParamSchemaVersion, 2);
});
