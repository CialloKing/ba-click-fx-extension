import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APPEARANCE_PRESETS,
  DEFAULT_SETTINGS,
  detectAppearancePreset,
  getQualityProfile,
  getSiteKey,
  normalizeSettings,
  shouldReduceMotion,
} from '../src/shared/settings.js';

test('缺省设置安装后立即启用点击和移动拖尾', () =>
{
  const settings = normalizeSettings();

  assert.equal(settings.enabled, true);
  assert.equal(settings.clickEnabled, true);
  assert.equal(settings.trailEnabled, true);
  assert.equal(settings.trailAlways, true);
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
    quality: 'ultra',
    languageMode: 'ja',
    motionMode: 'lots',
  });

  assert.equal(settings.enabled, false);
  assert.equal(settings.color, DEFAULT_SETTINGS.color);
  assert.equal(settings.opacity, 1);
  assert.equal(settings.scale, 0.5);
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

test('画质档位只保留 maxDpr，未知档位回退到 balanced', () =>
{
  assert.deepEqual(getQualityProfile('high'),
  {
    maxDpr: 2,
  });
  assert.deepEqual(getQualityProfile('performance'),
  {
    maxDpr: 1,
  });
  assert.deepEqual(getQualityProfile('unknown'), getQualityProfile('balanced'));
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
