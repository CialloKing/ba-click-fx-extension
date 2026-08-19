import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FX_PARAM_SCHEMA,
  FX_PARAM_SCHEMA_VERSION,
} from 'ba-click-fx';
import {
  FX_CONTROL_DEFINITIONS,
  FX_CONTROL_GROUPS,
  flattenFxParams,
  getFxParamDefault,
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
  assert.deepEqual(normalizeFxParams(
  {
    'rings.radiusMin': 80,
    'rings.radiusMax': 90,
  }),
  {
    'rings.radiusMin': 80,
    'rings.radiusMax': 90,
  });
});

test('旧 Schema 路径不再迁移，直接按未知路径拒绝', () =>
{
  const result = prepareFxParams(
  {
    'bloom.scatter': 0.35,
    'bloom.trailEmissionAlpha': 0.5,
    rootDurationMs: 1500,
  });

  // trailEmissionAlpha 仍是有效路径被保留，但不再自动联动计算 trailAlpha。
  assert.deepEqual(result.params,
  {
    'bloom.trailEmissionAlpha': 0.5,
  });
  const rejectedPaths = result.rejected.map(({ path }) => path);
  assert.equal(rejectedPaths.includes('bloom.scatter'), true);
  assert.equal(rejectedPaths.includes('rootDurationMs'), true);
});

test('当前 Schema 不再隐式联动两个拖尾 Alpha 参数', () =>
{
  assert.deepEqual(normalizeFxParams(
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

test('默认值来自 Schema 且显式覆盖优先于默认', () =>
{
  const flattened = flattenFxParams({});
  const explicit = normalizeFxParams(
  {
    'trail.width': 2.7,
    'bloom.trailAlpha': 0.18,
  });

  assert.equal(flattened['trail.width'], 2.7);
  assert.equal(flattened['bloom.trailAlpha'], 0.18);
  assert.equal(getFxParamDefault('trail.width'), 2.7);
  assert.deepEqual(explicit,
  {
    'trail.width': 2.7,
    'bloom.trailAlpha': 0.18,
  });
  assert.equal(flattenFxParams(explicit)['trail.width'], 2.7);
});
