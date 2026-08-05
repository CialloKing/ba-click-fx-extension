import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FX_PARAM_SCHEMA,
  FX_PARAM_SCHEMA_VERSION,
} from 'ba-click-fx';
import {
  FX_CONTROL_DEFINITIONS,
  FX_CONTROL_GROUPS,
  expandFxParams,
  flattenFxParams,
  getFxParamDefault,
  mergeFxParams,
  normalizeFxParams,
  prepareFxParams,
} from '../src/shared/fx-settings.js';

test('完整设置页从上游 Schema 派生全部 66 个公开参数', () =>
{
  assert.equal(FX_PARAM_SCHEMA_VERSION, 2);
  assert.equal(FX_CONTROL_DEFINITIONS.length, 66);
  assert.equal(FX_CONTROL_DEFINITIONS.length, FX_PARAM_SCHEMA.length);
  assert.equal(new Set(FX_CONTROL_DEFINITIONS.map(({ path }) => path)).size, 66);
  assert.deepEqual(FX_CONTROL_GROUPS.map(({ id }) => id),
  [
    'hit',
    'flare',
    'disk',
    'rings',
    'shards',
    'trail',
    'bloom',
  ]);
  assert.deepEqual(
    FX_CONTROL_DEFINITIONS.map(({ path }) => path),
    [...FX_PARAM_SCHEMA].sort((left, right) => left.order - right.order)
      .map(({ path }) => path),
  );

  for (const definition of FX_CONTROL_DEFINITIONS)
  {
    const descriptor = FX_PARAM_SCHEMA.find(({ path }) => path === definition.path);

    assert.ok(descriptor);
    assert.equal(definition.defaultValue, descriptor.default);
    assert.equal(definition.min, descriptor.display?.min ?? descriptor.min ?? null);
    assert.equal(definition.max, descriptor.display?.max ?? descriptor.max ?? null);
    assert.equal(definition.step, descriptor.display?.step ?? descriptor.step ?? null);
    assert.equal(definition.hardMin, descriptor.min ?? null);
    assert.equal(definition.hardMax, descriptor.max ?? null);
    assert.equal(definition.group, descriptor.group);
    assert.match(definition.i18nKey, /^fxParam_/);
  }

  const roundness = FX_CONTROL_DEFINITIONS.find(
    ({ path }) => path === 'shards.roundness',
  );

  assert.deepEqual(roundness,
  {
    id: 'fx-shards-roundness',
    path: 'shards.roundness',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.01,
    hardMin: 0,
    hardMax: 1,
    group: 'shards',
    groupOrder: 50,
    order: 295,
    type: 'number',
    unit: 'ratio',
    unitKey: 'unitRatio',
    i18nKey: 'fxParam_shards_roundness',
    linkedParams: [],
    modeDefaults: { enhanced: 0, legacy: 0 },
  });
});

test('参数校验使用硬边界且不会按推荐滑块步长量化', () =>
{
  assert.deepEqual(normalizeFxParams(
  {
    'rings.radiusMin': 999,
    'rings.angularVelocityMultiplier': 11.170107,
    'rings.unknown': 12,
    'hit.enabled': 'true',
  }),
  {
    'rings.radiusMin': 999,
    'rings.angularVelocityMultiplier': 11.170107,
  });
  assert.deepEqual(normalizeFxParams(
  {
    'rings.radiusMin': 99999,
  }),
  {
    'rings.radiusMin': 2000,
  });
  assert.deepEqual(mergeFxParams(
  {
    'rings.radiusMin': 80,
  },
  {
    'rings.radiusMax': 90,
  }),
  {
    'rings.radiusMin': 80,
    'rings.radiusMax': 90,
  });
});

test('Schema 0 参数迁移旧 Scatter、拖尾联动和废弃元数据', () =>
{
  const result = prepareFxParams(
  {
    'bloom.scatter': 0.35,
    'bloom.trailEmissionAlpha': 0.5,
    rootDurationMs: 1500,
  },
  {
    schemaVersion: 0,
  });

  assert.equal(result.committed, true);
  assert.deepEqual(result.params,
  {
    'bloom.diffusion': 7,
    'bloom.trailEmissionAlpha': 0.5,
    'bloom.trailAlpha': 0.09,
  });
  assert.equal(result.normalized.some(({ reason }) => reason === 'renamed'), true);
  assert.deepEqual(result.rejected,
  [{
    path: 'rootDurationMs',
    value: 1500,
    reason: 'deprecated-path',
  }]);
});

test('当前 Schema 不再隐式联动两个拖尾 Alpha 参数', () =>
{
  assert.deepEqual(expandFxParams(
  {
    'bloom.trailEmissionAlpha': 0.5,
  }),
  {
    'bloom.trailEmissionAlpha': 0.5,
  });
});

test('非严格模式报告拒绝项，严格模式整批回滚', () =>
{
  const patch =
  {
    'rings.radiusMin': 80,
    'rings.unknown': 1,
  };
  const partial = prepareFxParams(patch, { strict: false });
  const strict = prepareFxParams(patch, { strict: true });

  assert.equal(partial.committed, true);
  assert.deepEqual(partial.params, { 'rings.radiusMin': 80 });
  assert.equal(partial.rejected[0]?.reason, 'unknown-path');
  assert.equal(strict.committed, false);
  assert.deepEqual(strict.params, {});
  assert.equal(strict.rejected[0]?.reason, 'unknown-path');
});

test('模式默认值来自 Schema 且显式默认覆盖不会在切换模式时丢失', () =>
{
  const enhanced = flattenFxParams({}, 'webgl2-bloom');
  const legacy = flattenFxParams({}, 'legacy');
  const explicit = normalizeFxParams(
  {
    'trail.width': 2.7,
    'bloom.trailAlpha': 0.18,
  });

  assert.equal(enhanced['trail.width'], 2.7);
  assert.equal(enhanced['bloom.trailAlpha'], 0.18);
  assert.equal(legacy['trail.width'], 4);
  assert.equal(legacy['bloom.trailAlpha'], 0);
  assert.equal(getFxParamDefault('trail.width', 'legacy'), 4);
  assert.deepEqual(explicit,
  {
    'trail.width': 2.7,
    'bloom.trailAlpha': 0.18,
  });
  assert.equal(flattenFxParams(explicit, 'legacy')['trail.width'], 2.7);
});
