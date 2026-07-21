/**
 * 上游演示页可调特效参数的唯一模型。
 *
 * 存储只保留偏离上游默认值的主路径；联动路径在应用到引擎前再展开，
 * 避免同一个控件产生两份可能互相矛盾的持久化状态。
 */

export const FX_CONTROL_GROUPS = Object.freeze([
  Object.freeze({ id: 'clickRings', i18nKey: 'fxGroupClickRings' }),
  Object.freeze({ id: 'clickShards', i18nKey: 'fxGroupClickShards' }),
  Object.freeze({ id: 'clickBloom', i18nKey: 'fxGroupClickBloom' }),
  Object.freeze({ id: 'hitFlare', i18nKey: 'fxGroupHitFlare' }),
  Object.freeze({ id: 'trailLayer', i18nKey: 'fxGroupTrailLayer' }),
  Object.freeze({ id: 'trailShards', i18nKey: 'fxGroupTrailShards' }),
  Object.freeze({ id: 'trailBloom', i18nKey: 'fxGroupTrailBloom' }),
]);

function defineNumber(
  id,
  path,
  defaultValue,
  min,
  max,
  step,
  group,
  i18nKey,
  type = 'number',
  extra = {},
)
{
  return Object.freeze(
  {
    id,
    path,
    defaultValue,
    min,
    max,
    step,
    group,
    type,
    i18nKey,
    ...extra,
  });
}

const MILLISECONDS = Object.freeze({ unitKey: 'unitMilliseconds' });

function defineBoolean(id, path, defaultValue, group, i18nKey)
{
  return Object.freeze(
  {
    id,
    path,
    defaultValue,
    min: null,
    max: null,
    step: null,
    values: Object.freeze([false, true]),
    group,
    type: 'boolean',
    i18nKey,
  });
}

export const FX_CONTROL_DEFINITIONS = Object.freeze([
  defineNumber('ringHdrIntensity', 'rings.hdrIntensity', 5.992157, 0, 8, 0.01,
    'clickRings', 'fxRingHdrIntensity'),
  defineNumber('ringRadiusMin', 'rings.radiusMin', 51.0560832, 20, 120, 0.01,
    'clickRings', 'fxRingRadiusMin'),
  defineNumber('ringRadiusMax', 'rings.radiusMax', 59.5654304, 20, 120, 0.01,
    'clickRings', 'fxRingRadiusMax'),
  defineNumber('ringWidthStart', 'rings.widthStart', 1, 0.25, 2, 0.05,
    'clickRings', 'fxRingWidthStart'),
  defineNumber('ringWidthEnd', 'rings.widthEnd', 1, 0.25, 2, 0.05,
    'clickRings', 'fxRingWidthEnd'),
  defineNumber('ringLifetime', 'rings.lifetimeMs', 600, 50, 2000, 10,
    'clickRings', 'fxRingLifetime', 'integer', MILLISECONDS),

  // 展示页允许 0；v1.2.7 的 setter 会将 Count/Blur 的 0 钳制为 1。
  defineNumber('clickShardCount', 'shards.clickCount', 4, 0, 12, 1,
    'clickShards', 'fxClickShardCount', 'integer'),
  // 展示页的 5 步进无法表示引擎默认 96；整数步进仍覆盖其全部取值并保留精确默认值。
  defineNumber('maxShardCount', 'shards.maxCount', 96, 0, 500, 1,
    'clickShards', 'fxMaxShardCount', 'integer'),

  defineNumber('bloomRingBlur', 'bloom.ringBlur', 80, 0, 200, 5,
    'clickBloom', 'fxBloomRingBlur', 'integer'),
  defineNumber('bloomThreshold', 'bloom.threshold', 1, 0, 5, 0.05,
    'clickBloom', 'fxBloomThreshold'),
  defineNumber('bloomIntensity', 'bloom.intensity', 0.45, 0, 2, 0.05,
    'clickBloom', 'fxBloomIntensity'),
  defineNumber('bloomScatter', 'bloom.scatter', 0.35, 0, 1, 0.05,
    'clickBloom', 'fxBloomScatter'),
  defineNumber('ringCount', 'rings.count', 2, 1, 6, 1,
    'clickBloom', 'fxRingCount', 'integer'),
  defineNumber('diskRadius', 'disk.radius', 48, 20, 120, 1,
    'clickBloom', 'fxDiskRadius', 'integer'),
  defineNumber('diskLifetime', 'disk.lifetimeMs', 200, 50, 500, 10,
    'clickBloom', 'fxDiskLifetime', 'integer', MILLISECONDS),
  defineNumber('ringAngularVelocity', 'rings.angularVelocityMultiplier', 11.170107,
    1, 30, 0.1, 'clickBloom', 'fxRingAngularVelocity'),
  defineNumber('ringArcSamples', 'rings.arcSamples', 96, 24, 192, 8,
    'clickBloom', 'fxRingArcSamples', 'integer'),
  defineNumber('ringDirection', 'rings.rotationDirection', -1, -1, 1, 2,
    'clickBloom', 'fxRingDirection', 'integer'),
  defineNumber('rootDuration', 'rootDurationMs', 1000, 200, 2000, 50,
    'clickBloom', 'fxRootDuration', 'integer', MILLISECONDS),
  defineNumber('clickShardLifetimeMin', 'shards.clickLifetimeMinMs', 600,
    100, 1000, 10, 'clickBloom', 'fxClickShardLifetimeMin', 'integer', MILLISECONDS),
  defineNumber('clickShardLifetimeMax', 'shards.clickLifetimeMaxMs', 700,
    100, 1000, 10, 'clickBloom', 'fxClickShardLifetimeMax', 'integer', MILLISECONDS),

  defineBoolean('hitEnabled', 'hit.enabled', false, 'hitFlare', 'fxHitEnabled'),
  defineNumber('hitRadius', 'hit.radius', 24, 10, 60, 1,
    'hitFlare', 'fxHitRadius', 'integer'),
  defineNumber('hitLifetime', 'hit.lifetimeMs', 80, 20, 200, 10,
    'hitFlare', 'fxHitLifetime', 'integer', MILLISECONDS),
  defineBoolean('flareEnabled', 'flare.enabled', false, 'hitFlare', 'fxFlareEnabled'),
  defineNumber('flareRadius', 'flare.radius', 36, 10, 80, 1,
    'hitFlare', 'fxFlareRadius', 'integer'),
  defineNumber('flareLifetime', 'flare.lifetimeMs', 150, 50, 300, 10,
    'hitFlare', 'fxFlareLifetime', 'integer', MILLISECONDS),
  defineNumber('flareRayCount', 'flare.rayCount', 6, 3, 12, 1,
    'hitFlare', 'fxFlareRayCount', 'integer'),

  defineNumber('trailWidth', 'trail.width', 2, 1, 25, 0.1,
    'trailLayer', 'fxTrailWidth'),
  defineNumber('trailOuterGlowWidth', 'trail.outerGlowWidth', 9, 1, 40, 0.5,
    'trailLayer', 'fxTrailOuterGlowWidth'),
  defineNumber('trailLifetime', 'trail.lifetimeMs', 300, 50, 2000, 10,
    'trailLayer', 'fxTrailLifetime', 'integer', MILLISECONDS),

  defineNumber('trailShardSpacing', 'shards.trailSpacing', 80, 10, 500, 5,
    'trailShards', 'fxTrailShardSpacing', 'integer'),

  defineNumber('bloomTrailEmission', 'bloom.trailEmissionAlpha', 1, 0, 1, 0.01,
    'trailBloom', 'fxBloomTrailEmission', 'number',
    {
      linkedParams: Object.freeze([
        Object.freeze({ path: 'bloom.trailAlpha', factor: 0.18 }),
      ]),
    }),
  defineNumber('trailOpacity', 'trail.trailOpacity', 1, 0, 1, 0.05,
    'trailBloom', 'fxTrailOpacity'),
  defineNumber('trailGeometryWidth', 'trail.geometryWidth', 2, 1, 8, 0.5,
    'trailBloom', 'fxTrailGeometryWidth'),
  defineNumber('trailMinVertexDistance', 'trail.minVertexDistance', 4, 1, 20, 0.5,
    'trailBloom', 'fxTrailMinVertexDistance'),
  defineNumber('trailShardLifetimeMin', 'shards.trailLifetimeMinMs', 200,
    50, 500, 10, 'trailBloom', 'fxTrailShardLifetimeMin', 'integer', MILLISECONDS),
  defineNumber('trailShardLifetimeMax', 'shards.trailLifetimeMaxMs', 400,
    50, 500, 10, 'trailBloom', 'fxTrailShardLifetimeMax', 'integer', MILLISECONDS),
  defineNumber('bloomDiskBlur', 'bloom.diskBlur', 65, 0, 200, 5,
    'trailBloom', 'fxBloomDiskBlur', 'integer'),
]);

const FX_DEFINITION_BY_PATH = new Map(
  FX_CONTROL_DEFINITIONS.map((definition) => [definition.path, definition]),
);

function countDecimalPlaces(value)
{
  const text = String(value).toLowerCase();

  if (text.includes('e-'))
  {
    return Number(text.split('e-')[1]) || 0;
  }

  return text.includes('.') ? text.split('.')[1].length : 0;
}

function snapNumber(value, definition)
{
  const clamped = Math.max(definition.min, Math.min(definition.max, value));
  const steps = Math.round((clamped - definition.min) / definition.step);
  const snapped = definition.min + (steps * definition.step);
  const precision = Math.max(
    countDecimalPlaces(definition.min),
    countDecimalPlaces(definition.max),
    countDecimalPlaces(definition.step),
  );
  const rounded = Number(snapped.toFixed(precision));

  return Object.is(rounded, -0) ? 0 : rounded;
}

function normalizeFxValue(value, definition)
{
  if (definition.type === 'boolean')
  {
    return typeof value === 'boolean' ? value : definition.defaultValue;
  }

  if (typeof value !== 'number' || !Number.isFinite(value))
  {
    return definition.defaultValue;
  }

  // 精确的 Unity 默认值不一定落在演示页滑块步长上，默认值必须原样保留。
  if (value === definition.defaultValue)
  {
    return definition.defaultValue;
  }

  return snapNumber(value, definition);
}

export function normalizeFxParams(value = {})
{
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
  const normalized = {};

  for (const definition of FX_CONTROL_DEFINITIONS)
  {
    if (!Object.hasOwn(source, definition.path))
    {
      continue;
    }

    const nextValue = normalizeFxValue(source[definition.path], definition);

    if (nextValue !== definition.defaultValue)
    {
      normalized[definition.path] = nextValue;
    }
  }

  return normalized;
}

export function mergeFxParams(base = {}, patch = {})
{
  return normalizeFxParams(
  {
    ...normalizeFxParams(base),
    ...(patch && typeof patch === 'object' ? patch : {}),
  });
}

export function flattenFxParams(value = {})
{
  const overrides = normalizeFxParams(value);
  const flattened = {};

  for (const definition of FX_CONTROL_DEFINITIONS)
  {
    flattened[definition.path] = Object.hasOwn(overrides, definition.path)
      ? overrides[definition.path]
      : definition.defaultValue;
  }

  return flattened;
}

export function expandFxParams(value = {})
{
  const overrides = normalizeFxParams(value);
  const expanded = {};

  for (const [path, parameterValue] of Object.entries(overrides))
  {
    expanded[path] = parameterValue;
    const definition = FX_DEFINITION_BY_PATH.get(path);

    for (const linked of definition?.linkedParams || [])
    {
      expanded[linked.path] = parameterValue * linked.factor;
    }
  }

  return expanded;
}
