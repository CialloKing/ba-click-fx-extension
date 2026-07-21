import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FX_CONTROL_DEFINITIONS,
  FX_CONTROL_GROUPS,
  expandFxParams,
  flattenFxParams,
  mergeFxParams,
  normalizeFxParams,
} from '../src/shared/fx-settings.js';

test('完整设置页定义展示页的 39 个特效控件', () =>
{
  assert.equal(FX_CONTROL_DEFINITIONS.length, 39);
  assert.equal(new Set(FX_CONTROL_DEFINITIONS.map(({ path }) => path)).size, 39);
  assert.deepEqual(FX_CONTROL_GROUPS.map(({ id }) => id),
  [
    'clickRings',
    'clickShards',
    'clickBloom',
    'hitFlare',
    'trailLayer',
    'trailShards',
    'trailBloom',
  ]);
  assert.equal(
    FX_CONTROL_DEFINITIONS.every((definition) =>
      typeof definition.i18nKey === 'string' && definition.i18nKey.length > 0),
    true,
  );

  for (const definition of FX_CONTROL_DEFINITIONS)
  {
    if (definition.type === 'boolean')
    {
      continue;
    }

    const stepText = String(definition.step);
    const precision = stepText.includes('.') ? stepText.split('.')[1].length : 0;
    const sliderDefault = Number((
      definition.min + (
        Math.round((definition.defaultValue - definition.min) / definition.step) *
        definition.step
      )
    ).toFixed(precision));
    const displayedDefault = Number(definition.defaultValue.toFixed(precision));

    assert.equal(
      sliderDefault,
      displayedDefault,
      `${definition.path} 的默认读数必须是合法滑块步点`,
    );
  }
});

test('特效参数只稀疏保存有效的非默认覆盖', () =>
{
  assert.deepEqual(normalizeFxParams(
  {
    'rings.hdrIntensity': 5.992157,
    'rings.radiusMin': 999,
    'rings.unknown': 12,
    'bloom.trailAlpha': 0.18,
    'hit.enabled': 'true',
  }),
  {
    'rings.radiusMin': 120,
  });
  assert.deepEqual(mergeFxParams(
  {
    'rings.radiusMin': 80,
  },
  {
    'rings.radiusMin': 51.0560832,
  }), {});
});

test('拖尾 Bloom 控件展开原生回退联动参数', () =>
{
  assert.deepEqual(expandFxParams(
  {
    'bloom.trailEmissionAlpha': 0.5,
  }),
  {
    'bloom.trailEmissionAlpha': 0.5,
    'bloom.trailAlpha': 0.09,
  });
  assert.equal(flattenFxParams({})['rings.rotationDirection'], -1);
  assert.deepEqual(expandFxParams(
  {
    'rings.rotationDirection': -1,
  }), {});

  const allOverrides = Object.fromEntries(FX_CONTROL_DEFINITIONS.map((definition) =>
  [
    definition.path,
    definition.type === 'boolean'
      ? !definition.defaultValue
      : (definition.defaultValue === definition.min ? definition.max : definition.min),
  ]));

  assert.equal(Object.keys(expandFxParams(allOverrides)).length, 40);
});
