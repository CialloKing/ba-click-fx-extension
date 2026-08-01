import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { DEFAULT_SETTINGS } from '../src/shared/settings.js';
import {
  DEFAULT_EFFECT_SETTINGS,
  getCompositingControlState,
  getDefaultFxParam,
} from '../src/options/defaults.js';

test('完整设置页恢复扩展默认值而不是上游展示页合成', () =>
{
  assert.equal(DEFAULT_EFFECT_SETTINGS.outputCompositing, 'browser-overlay');
  assert.equal(DEFAULT_EFFECT_SETTINGS.hostCompositing, 'screen');
  assert.deepEqual(DEFAULT_EFFECT_SETTINGS.fxParams, DEFAULT_SETTINGS.fxParams);
  assert.equal(getDefaultFxParam('trail.width'), 2.7);
});

test('DOM Add 只启用当前有效的合成控件', () =>
{
  assert.deepEqual(getCompositingControlState(),
  {
    alphaControlsEnabled: false,
    hostCompositingEnabled: true,
    isolatedCompositingEnabled: false,
    lightBackgroundContrastEnabled: false,
  });
  assert.deepEqual(getCompositingControlState(
  {
    outputCompositing: 'browser-overlay',
    hostCompositing: 'source-over',
  }),
  {
    alphaControlsEnabled: true,
    hostCompositingEnabled: true,
    isolatedCompositingEnabled: true,
    lightBackgroundContrastEnabled: false,
  });
});

test('商店完整设置预览不覆盖扩展默认值', () =>
{
  const source = readFileSync(
    new URL('../store-assets/source/options-mock.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /const syncValues = \{\};/);
  assert.doesNotMatch(source, /\b(?:color|opacity|scale|quality|preset|renderMode):/);
});
