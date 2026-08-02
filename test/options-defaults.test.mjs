import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { DEFAULT_SETTINGS } from '../src/shared/settings.js';
import {
  DEFAULT_EFFECT_SETTINGS,
  getCompositingControlState,
  getDefaultFxParam,
} from '../src/options/defaults.js';

const optionsHtml = readFileSync(
  new URL('../src/options/options.html', import.meta.url),
  'utf8',
);

test('完整设置页恢复扩展默认值而不是上游展示页合成', () =>
{
  assert.equal(DEFAULT_EFFECT_SETTINGS.outputCompositing, 'browser-overlay');
  assert.equal(DEFAULT_EFFECT_SETTINGS.hostCompositing, 'screen');
  assert.deepEqual(
    {
      peak: DEFAULT_EFFECT_SETTINGS.webgpuHdrPeak,
      brightness: DEFAULT_EFFECT_SETTINGS.webgpuHdrBrightness,
      colorPreservation: DEFAULT_EFFECT_SETTINGS.webgpuHdrColorPreservation,
      whiteCore: DEFAULT_EFFECT_SETTINGS.webgpuHdrWhiteCore,
      whiteStart: DEFAULT_EFFECT_SETTINGS.webgpuHdrWhiteStart,
      whiteEnd: DEFAULT_EFFECT_SETTINGS.webgpuHdrWhiteEnd,
    },
    {
      peak: 3,
      brightness: 1,
      colorPreservation: 0,
      whiteCore: 0.6,
      whiteStart: 1,
      whiteEnd: 5,
    },
  );
  assert.deepEqual(DEFAULT_EFFECT_SETTINGS.fxParams, DEFAULT_SETTINGS.fxParams);
  assert.equal(getDefaultFxParam('trail.width'), 2.7);
});

test('完整设置页加载存储前静态显示扩展默认渲染模式', () =>
{
  const renderModeOptions = optionsHtml.match(
    /<select\b[^>]*\bid=["']render-mode["'][^>]*>([\s\S]*?)<\/select>/i,
  )?.[1] || '';

  assert.match(
    renderModeOptions,
    /<option\b(?=[^>]*\bvalue=["']full-webgl2["'])(?=[^>]*\bselected\b)[^>]*>/i,
  );
  assert.doesNotMatch(
    renderModeOptions,
    /<option\b(?=[^>]*\bvalue=["']full-webgpu["'])(?=[^>]*\bselected\b)[^>]*>/i,
  );
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
