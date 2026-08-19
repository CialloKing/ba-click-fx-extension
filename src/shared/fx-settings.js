/**
 * 上游公开参数 Schema 的扩展适配层。
 *
 * 上游负责参数类型、边界、默认值、顺序与迁移；扩展只补充控件 ID、
 * 本地化键和持久化稀疏化，避免两份参数合同再次漂移。
 */

import {
  FX_PARAM_SCHEMA,
  FX_PARAM_SCHEMA_VERSION,
  applyFxParamPatch,
} from 'ba-click-fx';

const DEPRECATED_ROOT_DURATION_PATH = 'rootDurationMs';
const LEGACY_TRAIL_EMISSION_PATH = 'bloom.trailEmissionAlpha';
const LEGACY_TRAIL_ALPHA_PATH = 'bloom.trailAlpha';
const LEGACY_TRAIL_ALPHA_FACTOR = 0.18;

const UNIT_I18N_KEYS = Object.freeze(
{
  count: 'unitCount',
  'gamma-hdr': 'unitGammaHdr',
  'linear-hdr': 'unitLinearHdr',
  ms: 'unitMilliseconds',
  multiplier: 'unitMultiplier',
  px: 'unitPixels',
  'px-per-second': 'unitPixelsPerSecond',
  ratio: 'unitRatio',
  samples: 'unitSamples',
  scalar: 'unitScalar',
});

function toIdentifier(value)
{
  return value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toMessageKey(prefix, value)
{
  return `${prefix}_${value.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

function toPatchObject(value)
{
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
}

function toAppliedObject(applied)
{
  return Object.fromEntries(applied.map(({ path, value }) => [path, value]));
}

function createControlDefinition(descriptor)
{
  const display = descriptor.display || {};

  return Object.freeze(
  {
    id: `fx-${toIdentifier(descriptor.path)}`,
    path: descriptor.path,
    defaultValue: descriptor.default,
    min: display.min ?? descriptor.min ?? null,
    max: display.max ?? descriptor.max ?? null,
    step: display.step ?? descriptor.step ?? null,
    hardMin: descriptor.min ?? null,
    hardMax: descriptor.max ?? null,
    group: descriptor.group,
    groupOrder: descriptor.groupOrder,
    order: descriptor.order,
    type: descriptor.type,
    unit: descriptor.unit,
    unitKey: UNIT_I18N_KEYS[descriptor.unit] || null,
    i18nKey: toMessageKey('fxParam', descriptor.path),
    linkedParams: descriptor.linkedParams,
  });
}

const sortedSchema = [...FX_PARAM_SCHEMA].sort((left, right) => left.order - right.order);

export const FX_CONTROL_DEFINITIONS = Object.freeze(
  sortedSchema.map(createControlDefinition),
);

export const FX_CONTROL_GROUPS = Object.freeze(
  [...new Map(
    sortedSchema.map((descriptor) => [descriptor.group, Object.freeze(
    {
      id: descriptor.group,
      order: descriptor.groupOrder,
      i18nKey: toMessageKey('fxGroup', descriptor.group),
    })]),
  ).values()].sort((left, right) => left.order - right.order),
);

const FX_DEFINITION_BY_PATH = new Map(
  FX_CONTROL_DEFINITIONS.map((definition) => [definition.path, definition]),
);

export {
  FX_PARAM_SCHEMA,
  FX_PARAM_SCHEMA_VERSION,
};

/**
 * 迁移并验证一组不可信参数，同时保留上游拒绝报告。
 */
export function prepareFxParams(value = {}, options = {})
{
  const {
    schemaVersion = FX_PARAM_SCHEMA_VERSION,
    strict = false,
  } = options;
  const source = toPatchObject(value);
  const patch = { ...source };
  const extensionRejected = [];

  if (Object.hasOwn(patch, DEPRECATED_ROOT_DURATION_PATH))
  {
    extensionRejected.push(
    {
      path: DEPRECATED_ROOT_DURATION_PATH,
      value: patch[DEPRECATED_ROOT_DURATION_PATH],
      reason: 'deprecated-path',
    });
    delete patch[DEPRECATED_ROOT_DURATION_PATH];
  }

  if (
    schemaVersion === 0 &&
    Object.hasOwn(patch, LEGACY_TRAIL_EMISSION_PATH) &&
    !Object.hasOwn(patch, LEGACY_TRAIL_ALPHA_PATH)
  )
  {
    // 旧扩展在运行时隐式写入此值；迁移时固化一次即可保留既有视觉。
    patch[LEGACY_TRAIL_ALPHA_PATH] =
      Number(patch[LEGACY_TRAIL_EMISSION_PATH]) * LEGACY_TRAIL_ALPHA_FACTOR;
  }

  const result = applyFxParamPatch(patch,
  {
    schemaVersion,
    strict,
  });
  const rejected = [...extensionRejected, ...result.rejected];
  const committed = (
    (result.committed || Object.keys(patch).length === 0) &&
    (!strict || extensionRejected.length === 0)
  );
  const params = {};

  if (committed)
  {
    for (const [path, parameterValue] of Object.entries(toAppliedObject(result.applied)))
    {
      if (FX_DEFINITION_BY_PATH.has(path))
      {
        params[path] = parameterValue;
      }
    }
  }

  return {
    ...result,
    committed,
    params,
    rejected,
  };
}

export function normalizeFxParams(value = {}, options = {})
{
  return prepareFxParams(value, options).params;
}

export function mergeFxParams(base = {}, patch = {}, options = {})
{
  return normalizeFxParams(
  {
    ...toPatchObject(base),
    ...toPatchObject(patch),
  }, options);
}

export function flattenFxParams(value = {})
{
  const overrides = normalizeFxParams(value,
  {
    schemaVersion: FX_PARAM_SCHEMA_VERSION,
  });
  const flattened = {};

  for (const definition of FX_CONTROL_DEFINITIONS)
  {
    flattened[definition.path] = Object.hasOwn(overrides, definition.path)
      ? overrides[definition.path]
      : definition.defaultValue;
  }

  return flattened;
}

export function getFxParamDefault(path)
{
  const definition = FX_DEFINITION_BY_PATH.get(path);

  return definition ? definition.defaultValue : undefined;
}

// 保留调用层的旧函数名；当前公开 Schema 不再声明隐式联动参数。
export function expandFxParams(value = {}, options = {})
{
  return normalizeFxParams(value, options);
}
