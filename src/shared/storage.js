import {
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SETTINGS,
  LEGACY_DISABLED_SITES_KEY,
  LOCAL_SETTING_KEYS,
  STORAGE_SCHEMA_VERSION,
  SYNC_SETTING_KEYS,
  getQualityConsistencyPatch,
  getQualitySettingsPatch,
  getSettingsMigrationPatch,
  mergeDisabledSites,
  normalizeDisabledSites,
  normalizeSettings,
} from './settings.js';

const LOCAL_SITE_RULES_SCHEMA_VERSION = 2;

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

function storageRemove(chromeApi, areaName, keys)
{
  return callStorage(chromeApi, areaName, 'remove', keys);
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
  const [storedSyncValues, localValues] = await Promise.all([
    storageGet(chromeApi, 'sync', [...SYNC_SETTING_KEYS, LEGACY_DISABLED_SITES_KEY]),
    storageGet(chromeApi, 'local', [...LOCAL_SETTING_KEYS, 'storageSchemaVersion']),
  ]);
  let syncValues = storedSyncValues || {};
  const legacyDisabledSites = normalizeDisabledSites(
    syncValues?.[LEGACY_DISABLED_SITES_KEY],
  );
  let disabledSites = normalizeDisabledSites(localValues?.disabledSites);
  let storageSchemaVersion = Number(localValues?.storageSchemaVersion) || 0;

  if (storageSchemaVersion < LOCAL_SITE_RULES_SCHEMA_VERSION)
  {
    disabledSites = mergeDisabledSites(disabledSites, legacyDisabledSites);
  }

  const migrationPatch = getSettingsMigrationPatch(syncValues);

  if (Object.keys(migrationPatch).length > 0)
  {
    // 一次写回全部旧默认字段，避免后续局部设置使迁移结果丢失。
    await storageSet(chromeApi, 'sync', migrationPatch);
    syncValues = { ...syncValues, ...migrationPatch };
  }

  // 旧设备可能只更新 quality；读取时以该公共档位为准，避免异步回写覆盖用户的新选择。
  syncValues = { ...syncValues, ...getQualityConsistencyPatch(syncValues) };

  if (storageSchemaVersion < STORAGE_SCHEMA_VERSION)
  {
    storageSchemaVersion = STORAGE_SCHEMA_VERSION;

    // 保留旧 sync 键，避免扩展更新时把尚未同步到其他设备的站点规则删掉。
    await storageSet(chromeApi, 'local',
    {
      disabledSites,
      storageSchemaVersion,
    });
  }

  return {
    settings: normalizeSettings(
    {
      ...syncValues,
      disabledSites,
    }),
    storageSchemaVersion,
    hasLegacyDisabledSites: Object.keys(legacyDisabledSites).length > 0,
  };
}

export async function readSettings(chromeApi = globalThis.chrome)
{
  const state = await loadStorageState(chromeApi);

  return state.settings;
}

export async function writeSettingsPatch(patch, chromeApi = globalThis.chrome)
{
  const expandedPatch = Object.hasOwn(patch, 'quality')
    ? { ...getQualitySettingsPatch(patch.quality), ...patch }
    : patch;
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

export async function removeLegacyDisabledSites(chromeApi = globalThis.chrome)
{
  await storageRemove(chromeApi, 'sync', LEGACY_DISABLED_SITES_KEY);
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

  const expandedPatch = (
    areaName === 'sync' &&
    Object.hasOwn(patch, 'quality') &&
    !Object.hasOwn(patch, 'renderMode') &&
    !Object.hasOwn(patch, 'maxDpr')
  )
    ? { ...getQualitySettingsPatch(patch.quality), ...patch }
    : patch;

  // 兼容尚未升级的设备：它们只写 quality，新字段仍应跟随该快捷档。
  return normalizeSettings({ ...settings, ...expandedPatch });
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
