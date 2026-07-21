import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APPEARANCE_PRESETS,
  DEFAULT_SETTINGS,
  detectAppearancePreset,
  detectQualityProfile,
  getClassicDefaultsMigrationPatch,
  getQualityProfile,
  getQualitySettingsPatch,
  getRenderModeProfile,
  getSiteKey,
  normalizeSettings,
  shouldReduceMotion,
} from '../src/shared/settings.js';

test('缺省设置与上游演示页一致', () =>
{
  const settings = normalizeSettings();

  assert.equal(settings.enabled, true);
  assert.equal(settings.clickEnabled, true);
  assert.equal(settings.trailEnabled, true);
  assert.equal(settings.trailAlways, false);
  assert.equal(settings.opacity, 1);
  assert.equal(settings.scale, 1);
  assert.equal(settings.quality, 'ultra');
  assert.equal(settings.renderMode, 'webgl2-bloom');
  assert.equal(settings.maxDpr, 2);
  assert.deepEqual(settings.fxParams, {});
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
    quality: 'cinematic',
    languageMode: 'ja',
    motionMode: 'lots',
  });

  assert.equal(settings.enabled, false);
  assert.equal(settings.color, DEFAULT_SETTINGS.color);
  assert.equal(settings.opacity, 1);
  assert.equal(settings.scale, 0.01);
  assert.equal(settings.quality, DEFAULT_SETTINGS.quality);
  assert.equal(settings.languageMode, DEFAULT_SETTINGS.languageMode);
  assert.equal(settings.motionMode, DEFAULT_SETTINGS.motionMode);
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

test('三档画质映射 Legacy、原生辉光与 WebGL2 Bloom', () =>
{
  assert.deepEqual(getQualityProfile('balanced'),
  {
    renderMode: 'legacy',
    maxDpr: 1,
  });
  assert.deepEqual(getQualityProfile('high'),
  {
    renderMode: 'native-bloom',
    maxDpr: 2,
  });
  assert.deepEqual(getQualityProfile('ultra'),
  {
    renderMode: 'webgl2-bloom',
    maxDpr: 2,
  });
  assert.deepEqual(getQualityProfile('unknown'), getQualityProfile('ultra'));
  assert.deepEqual(getRenderModeProfile('software-bloom'),
  {
    renderingMode: 'enhanced',
    bloomBackend: 'software',
  });
  assert.deepEqual(getQualitySettingsPatch('balanced'),
  {
    quality: 'balanced',
    renderMode: 'legacy',
    maxDpr: 1,
  });
  assert.equal(detectQualityProfile('software-bloom', 2), 'custom');
  assert.deepEqual(normalizeSettings(
  {
    quality: 'ultra',
    renderMode: 'software-bloom',
    maxDpr: 3,
  }),
  {
    ...DEFAULT_SETTINGS,
    quality: 'custom',
    renderMode: 'software-bloom',
    maxDpr: 3,
    preset: 'custom',
  });
});

test('旧省电画质会迁移到新的均衡档', () =>
{
  assert.equal(normalizeSettings({ quality: 'performance' }).quality, 'balanced');
});

test('旧版经典默认参数生成持久化补丁且保留显式拖尾选择', () =>
{
  const migrated = getClassicDefaultsMigrationPatch(
  {
    preset: 'classic',
    color: '#69a1ff',
    opacity: 0.5,
    scale: 1.1,
    quality: 'balanced',
  });
  const explicitTrail = getClassicDefaultsMigrationPatch(
  {
    preset: 'classic',
    color: '#69a1ff',
    opacity: 0.5,
    scale: 1.1,
    quality: 'balanced',
    trailAlways: true,
  });
  const custom = getClassicDefaultsMigrationPatch({ preset: 'custom' });

  assert.deepEqual(migrated,
  {
    color: '#69a1ff',
    opacity: 1,
    scale: 1,
    quality: 'ultra',
    preset: 'classic',
    trailAlways: false,
  });
  assert.deepEqual(explicitTrail,
  {
    color: '#69a1ff',
    opacity: 1,
    scale: 1,
    quality: 'ultra',
    preset: 'classic',
  });
  assert.deepEqual(custom, {});
});

test('外观预设可识别，手动外观保持自定义状态', () =>
{
  assert.equal(detectAppearancePreset(APPEARANCE_PRESETS.soft), 'soft');
  assert.equal(detectAppearancePreset(
  {
    ...APPEARANCE_PRESETS.classic,
    opacity: 0.6,
  }), 'custom');
  assert.equal(normalizeSettings(
  {
    ...APPEARANCE_PRESETS.soft,
  }).preset, 'soft');
});

test('减少动态只覆盖持续移动拖尾偏好', () =>
{
  assert.equal(shouldReduceMotion({ motionMode: 'reduced' }, false), true);
  assert.equal(shouldReduceMotion({ motionMode: 'full' }, true), false);
  assert.equal(shouldReduceMotion({ motionMode: 'system' }, true), true);
  assert.equal(shouldReduceMotion({ motionMode: 'system' }, false), false);
});
