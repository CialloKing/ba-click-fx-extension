import {
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SETTINGS,
  LOCAL_SETTING_KEYS,
  SYNC_SETTING_KEYS,
  normalizeDisabledSites,
  normalizeSettings,
} from './settings.js';
import {
  prepareFxParams,
} from './fx-settings.js';

function getStorageArea(chromeApi, areaName)
{
  const area = chromeApi?.storage?.[areaName];

  if (!area)
  {
    throw new Error(`浏览器不支持 storage.${areaName}。`);
  }

  return area;
}

function callStorage(chromeApi, areaName, method, value)
{
  return new Promise((resolve, reject) =>
  {
    const area = getStorageArea(chromeApi, areaName);

    area[method](value, (result) =>
    {
      const error = chromeApi?.runtime?.lastError;

      if (error)
      {
        reject(new Error(error.message));
        return;
      }

      resolve(result);
    });
  });
}

function storageGet(chromeApi, areaName, keys)
{
  return callStorage(chromeApi, areaName, 'get', keys);
}

function storageSet(chromeApi, areaName, values)
{
  return callStorage(chromeApi, areaName, 'set', values);
}

function selectValues(source, keys)
{
  const selected = {};

  for (const key of keys)
  {
    if (Object.hasOwn(source, key))
    {
      selected[key] = source[key];
    }
  }

  return selected;
}

export async function loadStorageState(chromeApi = globalThis.chrome)
{
  const [syncValues, localValues] = await Promise.all([
    storageGet(chromeApi, 'sync', SYNC_SETTING_KEYS),
    storageGet(chromeApi, 'local', LOCAL_SETTING_KEYS),
  ]);

  return {
    settings: normalizeSettings(
    {
      ...(syncValues || {}),
      disabledSites: normalizeDisabledSites(localValues?.disabledSites),
    }),
  };
}

export async function readSettings(chromeApi = globalThis.chrome)
{
  const state = await loadStorageState(chromeApi);

  return state.settings;
}

export async function writeSettingsPatch(patch, chromeApi = globalThis.chrome)
{
  let expandedPatch = { ...patch };

  if (Object.hasOwn(expandedPatch, 'fxParams'))
  {
    const result = prepareFxParams(expandedPatch.fxParams,
    {
      strict: true,
    });

    if (!result.committed)
    {
      const reasons = result.rejected
        .map(({ path, reason }) => `${path}: ${reason}`)
        .join(', ');

      throw new Error(`特效参数未通过校验：${reasons || 'unknown'}`);
    }

    expandedPatch =
    {
      ...expandedPatch,
      fxParams: result.params,
    };
  }

  const normalized = normalizeSettings({ ...DEFAULT_SETTINGS, ...expandedPatch });
  const syncPatch = selectValues(normalized, SYNC_SETTING_KEYS.filter((key) =>
    Object.hasOwn(expandedPatch, key)));
  const localPatch = selectValues(normalized, LOCAL_SETTING_KEYS.filter((key) =>
    Object.hasOwn(expandedPatch, key)));
  const writes = [];

  if (Object.keys(syncPatch).length > 0)
  {
    writes.push(storageSet(chromeApi, 'sync', syncPatch));
  }

  if (Object.keys(localPatch).length > 0)
  {
    writes.push(storageSet(chromeApi, 'local', localPatch));
  }

  await Promise.all(writes);
}

export function createSettingsWriteQueue(writer = writeSettingsPatch)
{
  let tail = Promise.resolve();

  return (patch) =>
  {
    const operation = tail.then(() => writer(patch));

    // 队列尾部只负责恢复串行链；调用方仍会收到当前写入的原始拒绝。
    tail = operation.catch(() =>
    {
    });

    return operation;
  };
}

export function applyStorageChanges(settings, changes, areaName)
{
  const patch = {};
  const acceptedKeys = areaName === 'sync' ? SYNC_SETTING_KEYS : LOCAL_SETTING_KEYS;

  for (const key of acceptedKeys)
  {
    if (Object.hasOwn(changes, key))
    {
      patch[key] = changes[key].newValue;
    }
  }

  if (Object.keys(patch).length === 0)
  {
    return settings;
  }

  return normalizeSettings({ ...settings, ...patch });
}

export function getDefaultStorageRecords()
{
  return {
    sync: selectValues(DEFAULT_SETTINGS, SYNC_SETTING_KEYS),
    local: {
      ...DEFAULT_LOCAL_SETTINGS,
      disabledSites: {},
    },
  };
}
