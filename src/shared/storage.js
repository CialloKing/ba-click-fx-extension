import {
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SETTINGS,
  LEGACY_DISABLED_SITES_KEY,
  LOCAL_SETTING_KEYS,
  STORAGE_SCHEMA_VERSION,
  SYNC_SETTING_KEYS,
  getSettingsMigrationPatch,
  mergeDisabledSites,
  normalizeDisabledSites,
  normalizeSettings,
} from './settings.js';
import {
  FX_PARAM_SCHEMA_VERSION,
  getFxParamDefault,
  prepareFxParams,
} from './fx-settings.js';

const LOCAL_SITE_RULES_SCHEMA_VERSION = 2;
const ROUNDNESS_PARAM_PATH = 'shards.roundness';

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

function getStoredFxParamSchemaVersion(values)
{
  const version = Number(values?.fxParamSchemaVersion);

  return Number.isInteger(version) && version >= 0 ? version : 0;
}

function hasUnsupportedFxParamSchemaVersion(value)
{
  const version = Number(value);

  return Number.isInteger(version) && version > FX_PARAM_SCHEMA_VERSION;
}

function hasLegacyFxParamPath(value)
{
  const params = value && typeof value === 'object' ? value : {};

  // 增量事件不总是包含未变化的版本键；只有旧 Schema 独占路径能安全判为 v0。
  return Object.hasOwn(params, 'bloom.scatter') ||
    Object.hasOwn(params, 'rootDurationMs');
}

function haveSameEntries(left, right)
{
  const leftEntries = Object.entries(left || {});
  const rightEntries = Object.entries(right || {});

  return leftEntries.length === rightEntries.length &&
    leftEntries.every(([key, value]) => right?.[key] === value);
}

function isFxParamPatch(value)
{
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
}

function addSchemaDefaults(source, schemaVersion, report)
{
  const sourceParams = isFxParamPatch(source.fxParams);

  // Schema 2 新增圆角参数；旧记录没有该路径时沿用核心默认值，
  // 但不为从未保存过特效参数的新用户制造一项“用户覆盖”。
  if (
    schemaVersion >= FX_PARAM_SCHEMA_VERSION ||
    !Object.hasOwn(source, 'fxParams') ||
    !sourceParams ||
    Object.keys(sourceParams).length === 0 ||
    !report.committed ||
    Object.hasOwn(report.params, ROUNDNESS_PARAM_PATH)
  )
  {
    return report;
  }

  const defaultValue = getFxParamDefault(ROUNDNESS_PARAM_PATH);

  return {
    ...report,
    params:
    {
      ...report.params,
      [ROUNDNESS_PARAM_PATH]: defaultValue,
    },
    normalized: [
      ...report.normalized,
      {
        path: ROUNDNESS_PARAM_PATH,
        from: undefined,
        to: defaultValue,
        reason: 'defaulted',
      },
    ],
  };
}

export function getFxParamsMigration(values = {})
{
  const source = values && typeof values === 'object' ? values : {};
  const schemaVersion = getStoredFxParamSchemaVersion(source);

  if (schemaVersion > FX_PARAM_SCHEMA_VERSION)
  {
    return {
      patch: {},
      report:
      {
        applied: [],
        normalized: [],
        rejected: [
          {
            path: 'fxParamSchemaVersion',
            value: schemaVersion,
            reason: 'unsupported-schema-version',
          },
        ],
        committed: false,
        schemaVersion,
      },
    };
  }

  const preparedReport = prepareFxParams(source.fxParams,
  {
    schemaVersion,
    strict: false,
  });
  const report = addSchemaDefaults(source, schemaVersion, preparedReport);
  const needsWrite = schemaVersion !== FX_PARAM_SCHEMA_VERSION ||
    !haveSameEntries(source.fxParams, report.params);

  return {
    patch: needsWrite
      ? {
        fxParams: report.params,
        fxParamSchemaVersion: FX_PARAM_SCHEMA_VERSION,
      }
      : {},
    report,
  };
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

  const fxParamsMigration = getFxParamsMigration(syncValues);
  const migrationPatch =
  {
    ...getSettingsMigrationPatch(syncValues),
    ...fxParamsMigration.patch,
  };

  if (Object.keys(migrationPatch).length > 0)
  {
    // 一次写回全部旧默认字段，避免后续局部设置使迁移结果丢失。
    await storageSet(chromeApi, 'sync', migrationPatch);
    syncValues = { ...syncValues, ...migrationPatch };
  }

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
    fxParamMigrationReport: fxParamsMigration.report,
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

  if (
    Object.hasOwn(expandedPatch, 'fxParamSchemaVersion') &&
    hasUnsupportedFxParamSchemaVersion(expandedPatch.fxParamSchemaVersion)
  )
  {
    throw new Error(
      `特效参数 Schema 版本不受支持：${expandedPatch.fxParamSchemaVersion}`,
    );
  }

  if (Object.hasOwn(expandedPatch, 'fxParams'))
  {
    const result = prepareFxParams(expandedPatch.fxParams,
    {
      schemaVersion: FX_PARAM_SCHEMA_VERSION,
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
      fxParamSchemaVersion: FX_PARAM_SCHEMA_VERSION,
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

  if (
    areaName === 'sync' &&
    Object.hasOwn(patch, 'fxParamSchemaVersion') &&
    hasUnsupportedFxParamSchemaVersion(patch.fxParamSchemaVersion)
  )
  {
    // 版本键可能与参数键分开到达；同样不能把当前状态降级或清空。
    return settings;
  }

  const expandedPatch = patch;

  if (areaName === 'sync' && Object.hasOwn(expandedPatch, 'fxParams'))
  {
    const incomingVersion = Object.hasOwn(expandedPatch, 'fxParamSchemaVersion')
      ? expandedPatch.fxParamSchemaVersion
      : hasLegacyFxParamPath(expandedPatch.fxParams)
        ? 0
        : settings.fxParamSchemaVersion;
    const result = prepareFxParams(expandedPatch.fxParams,
    {
      schemaVersion: incomingVersion,
      strict: false,
    });

    if (result.rejected.some(({ reason }) => reason === 'unsupported-schema-version'))
    {
      // 其他设备可能已经使用更新的核心；当前版本无法安全解释其参数，
      // 忽略这次事件并等待扩展自身升级，不能把版本号降回当前值。
      return settings;
    }

    const migrated = addSchemaDefaults(
    {
      fxParams: expandedPatch.fxParams,
    },
    incomingVersion,
    result);

    expandedPatch.fxParams = migrated.params;
    expandedPatch.fxParamSchemaVersion = FX_PARAM_SCHEMA_VERSION;
  }

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
