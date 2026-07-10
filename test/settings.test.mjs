import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_SETTINGS,
  getEffectiveMaxDpr,
  getQualityProfile,
  getSiteKey,
  hexToRgb,
  normalizeSettings,
} from '../src/shared/settings.js';

test('缺省设置安装后立即启用点击和移动拖尾', () =>
{
  const settings = normalizeSettings();

  assert.equal(settings.enabled, true);
  assert.equal(settings.clickEnabled, true);
  assert.equal(settings.trailEnabled, true);
  assert.equal(settings.trailAlways, true);
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
  });

  assert.equal(settings.enabled, false);
  assert.equal(settings.color, DEFAULT_SETTINGS.color);
  assert.equal(settings.opacity, 1);
  assert.equal(settings.scale, 0.5);
  assert.equal(settings.quality, DEFAULT_SETTINGS.quality);
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

test('画质和颜色转换结果可直接传给核心 API', () =>
{
  assert.deepEqual(hexToRgb('#69a1ff'), [105, 161, 255]);
  assert.deepEqual(getQualityProfile('high'),
  {
    maxDpr: 2,
    trailRenderScale: 1,
  });
  assert.deepEqual(getQualityProfile('unknown'), getQualityProfile('balanced'));
  assert.equal(getEffectiveMaxDpr('high', 1920, 1080, 1920, 1080), 2);
  assert.ok(getEffectiveMaxDpr('high', 3840, 2160, 3840, 2160) < 1.2);
  assert.equal(getEffectiveMaxDpr('balanced', 3840, 2160, 3840, 2160), 1);
  assert.ok(Number.isFinite(getEffectiveMaxDpr('high', undefined, 0, Number.NaN, -1)));
});
