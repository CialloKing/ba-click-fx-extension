import assert from 'node:assert/strict';
import test from 'node:test';

import { CONFIG } from 'ba-click-fx';
import {
  APPEARANCE_PRESETS,
  DEFAULT_SETTINGS,
  detectAppearancePreset,
  getAppearancePresetPatch,
  getRenderModeProfile,
  getSiteKey,
  normalizeSettings,
  shouldReduceMotion,
} from '../src/shared/settings.js';

test('扩展缺省设置使用 DOM Add 而不是上游展示页合成', () =>
{
  const settings = normalizeSettings();

  assert.equal(settings.enabled, true);
  assert.equal(settings.clickEnabled, true);
  assert.equal(settings.trailEnabled, true);
  assert.equal(settings.trailAlways, false);
  assert.equal(settings.color, '#4ca7ff');
  assert.equal(settings.opacity, 1);
  assert.equal(settings.scale, 1);
  assert.equal(settings.renderMode, 'full-webgl2');
  assert.equal(settings.maxDpr, 2);
  assert.equal(settings.webgpuHdrPeak, 3);
  assert.equal(settings.webgpuHdrBrightness, 1);
  assert.equal(settings.webgpuHdrColorPreservation, 0);
  assert.equal(settings.webgpuHdrWhiteCore, 0.6);
  assert.equal(settings.webgpuHdrWhiteStart, 1);
  assert.equal(settings.webgpuHdrWhiteEnd, 5);
  assert.deepEqual(settings.fxParams, {});
  assert.equal(settings.fxParamSchemaVersion, 1);
  assert.equal(settings.clickTimeScale, 1);
  assert.equal(settings.trailTimeScale, 1);
  assert.equal(settings.outputCompositing, 'browser-overlay');
  assert.equal(settings.overlayAlphaPolicy, 'coverage');
  assert.equal(settings.overlayColorCompensation, 'none');
  assert.equal(settings.overlayAlphaLimit, 250 / 255);
  assert.equal(settings.hostCompositing, 'screen');
  assert.equal(settings.isolatedCompositing, false);
  assert.equal(settings.lightBackgroundContrastAlpha, 0);
  assert.equal(settings.languageMode, 'system');
  assert.equal(settings.motionMode, 'system');
  assert.equal(settings.preset, 'classic');
  assert.deepEqual(settings.disabledSites, {});
});

test('无效设置会回退或裁剪到安全范围', () =>
{
  const settings = normalizeSettings(
  {
    enabled: 'true',
    color: 'blue',
    opacity: 99,
    scale: -20,
    renderMode: 'cinematic',
    maxDpr: 99,
    languageMode: 'ja',
    motionMode: 'lots',
  });

  assert.equal(settings.enabled, false);
  assert.equal(settings.color, DEFAULT_SETTINGS.color);
  assert.equal(settings.opacity, 1);
  assert.equal(settings.scale, 0.01);
  assert.equal(settings.renderMode, DEFAULT_SETTINGS.renderMode);
  assert.equal(settings.maxDpr, 3);
  assert.equal(settings.languageMode, DEFAULT_SETTINGS.languageMode);
  assert.equal(settings.motionMode, DEFAULT_SETTINGS.motionMode);
});

test('时间倍率与上游共享 0.01 的最低有效值', () =>
{
  const settings = normalizeSettings(
  {
    clickTimeScale: 0.01,
    trailTimeScale: 0.001,
  });

  assert.equal(settings.clickTimeScale, 0.01);
  assert.equal(settings.trailTimeScale, 0.01);
});

test('WebGPU HDR 使用扩展固定基线并保持有效白核区间', () =>
{
  for (const key of [
    'webgpuHdrPeak',
    'webgpuHdrBrightness',
    'webgpuHdrColorPreservation',
    'webgpuHdrWhiteCore',
    'webgpuHdrWhiteStart',
    'webgpuHdrWhiteEnd',
  ])
  {
    assert.equal(DEFAULT_SETTINGS[key], CONFIG[key]);
  }

  const settings = normalizeSettings(
  {
    webgpuHdrPeak: 9,
    webgpuHdrBrightness: -1,
    webgpuHdrColorPreservation: 2,
    webgpuHdrWhiteCore: -1,
    webgpuHdrWhiteStart: 15.99,
    webgpuHdrWhiteEnd: 0.01,
  });

  assert.equal(settings.webgpuHdrPeak, 4);
  assert.equal(settings.webgpuHdrBrightness, 0);
  assert.equal(settings.webgpuHdrColorPreservation, 1);
  assert.equal(settings.webgpuHdrWhiteCore, 0);
  assert.equal(settings.webgpuHdrWhiteStart, 15.99);
  assert.equal(settings.webgpuHdrWhiteEnd, 16);
});

test('1.2.17 透明合同拆分并兼容旧覆盖层值', () =>
{
  const migrated = normalizeSettings(
  {
    outputCompositing: 'transparent-overlay',
    overlayAlphaPolicy: 'visual-max',
    overlayColorCompensation: 'bright-core',
    overlayAlphaLimit: 0.7,
    hostCompositing: 'plus-lighter',
  });

  assert.equal(migrated.outputCompositing, 'browser-overlay');
  assert.equal(migrated.overlayAlphaPolicy, 'visual-max');
  assert.equal(migrated.overlayColorCompensation, 'bright-core');
  assert.equal(migrated.overlayAlphaLimit, 0.7);
  assert.equal(migrated.hostCompositing, 'plus-lighter');

  const invalid = normalizeSettings(
  {
    outputCompositing: 'browser-overlay',
    overlayAlphaPolicy: 'invalid',
    overlayColorCompensation: 'invalid',
    overlayAlphaLimit: 4,
    hostCompositing: 'invalid',
  });

  assert.equal(invalid.overlayAlphaPolicy, 'coverage');
  assert.equal(invalid.overlayColorCompensation, 'none');
  assert.equal(invalid.overlayAlphaLimit, 1);
  assert.equal(invalid.hostCompositing, DEFAULT_SETTINGS.hostCompositing);
});

test('1.2.19 保留 Screen 宿主混合模式', () =>
{
  const settings = normalizeSettings(
  {
    outputCompositing: 'browser-overlay',
    hostCompositing: 'screen',
  });

  assert.equal(settings.hostCompositing, 'screen');
});

test('站点禁用规则只保留明确的 true 值', () =>
{
  const settings = normalizeSettings(
  {
    disabledSites:
    {
      'https://example.com': true,
      'https://enabled.example': false,
      'https://invalid.example': 'true',
    },
  });

  assert.deepEqual(settings.disabledSites,
  {
    'https://example.com': true,
  });
});

test('站点键按源隔离，并为本地文件提供稳定键', () =>
{
  assert.equal(getSiteKey('https://example.com/path?q=1'), 'https://example.com');
  assert.equal(getSiteKey('http://example.com/other'), 'http://example.com');
  assert.equal(getSiteKey('file:///D:/demo/index.html'), 'file://');
  assert.equal(getSiteKey('chrome://extensions'), null);
  assert.equal(getSiteKey('not a url'), null);
});

test('渲染模式映射公开后端并允许自定义 DPR', () =>
{
  assert.deepEqual(getRenderModeProfile('software-bloom'),
  {
    effectBackend: 'canvas2d',
    renderingMode: 'enhanced',
    bloomBackend: 'software',
  });
  assert.deepEqual(getRenderModeProfile('full-webgl2'),
  {
    effectBackend: 'webgl2',
    renderingMode: 'enhanced',
    bloomBackend: 'webgl2',
  });
  assert.deepEqual(getRenderModeProfile('full-webgpu'),
  {
    effectBackend: 'webgpu',
    renderingMode: 'enhanced',
    bloomBackend: 'webgl2',
  });
  assert.equal(normalizeSettings(
  {
    renderMode: 'webgl2-bloom',
    maxDpr: 1.5,
  }).maxDpr, 1.5);
  assert.deepEqual(normalizeSettings(
  {
    renderMode: 'software-bloom',
    maxDpr: 3,
  }),
  {
    ...DEFAULT_SETTINGS,
    renderMode: 'software-bloom',
    maxDpr: 3,
    preset: 'custom',
  });
});

test('旧 quality 字段不再进入设置模型', () =>
{
  const settings = normalizeSettings({ quality: 'balanced' });

  assert.equal(Object.hasOwn(settings, 'quality'), false);
  assert.equal(settings.renderMode, DEFAULT_SETTINGS.renderMode);
  assert.equal(settings.maxDpr, DEFAULT_SETTINGS.maxDpr);
});

test('外观预设可识别，手动外观保持自定义状态', () =>
{
  assert.deepEqual(getAppearancePresetPatch('soft'),
  {
    outputCompositing: 'browser-overlay',
    overlayAlphaPolicy: 'coverage',
    overlayColorCompensation: 'none',
    overlayAlphaLimit: 250 / 255,
    hostCompositing: 'screen',
    isolatedCompositing: false,
    lightBackgroundContrastAlpha: 0,
    color: '#8edcff',
    opacity: 0.35,
    scale: 0.9,
    renderMode: 'legacy',
    maxDpr: 1,
    preset: 'soft',
  });
  assert.deepEqual(getAppearancePresetPatch('light-background'),
  {
    outputCompositing: 'browser-overlay',
    overlayAlphaPolicy: 'visual-max',
    overlayColorCompensation: 'none',
    overlayAlphaLimit: 0.85,
    hostCompositing: 'source-over',
    isolatedCompositing: false,
    lightBackgroundContrastAlpha: 0,
    color: '#4ca7ff',
    opacity: 1,
    scale: 1,
    renderMode: 'full-webgl2',
    maxDpr: 2,
    preset: 'light-background',
  });
  assert.deepEqual(getAppearancePresetPatch('unknown'), { preset: 'custom' });
  assert.equal(detectAppearancePreset(getAppearancePresetPatch('soft')), 'soft');
  assert.equal(
    detectAppearancePreset(getAppearancePresetPatch('light-background')),
    'light-background',
  );
  assert.equal(detectAppearancePreset(
  {
    ...getAppearancePresetPatch('classic'),
    opacity: 0.6,
  }), 'custom');
  assert.equal(normalizeSettings(
  {
    ...APPEARANCE_PRESETS.soft,
  }).preset, 'soft');
  assert.equal(normalizeSettings(
  {
    ...getAppearancePresetPatch('light-background'),
    preset: 'classic',
  }).preset, 'light-background');
  assert.equal(normalizeSettings(
  {
    ...getAppearancePresetPatch('classic'),
    renderMode: 'legacy',
    maxDpr: 1,
    preset: 'classic',
  }).preset, 'custom');
});

test('减少动态只覆盖持续移动拖尾偏好', () =>
{
  assert.equal(shouldReduceMotion({ motionMode: 'reduced' }, false), true);
  assert.equal(shouldReduceMotion({ motionMode: 'full' }, true), false);
  assert.equal(shouldReduceMotion({ motionMode: 'system' }, true), true);
  assert.equal(shouldReduceMotion({ motionMode: 'system' }, false), false);
});
