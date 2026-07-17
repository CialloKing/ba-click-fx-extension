/**
 * 扩展设置的唯一数据模型。
 * 内容脚本、弹窗和设置页共用这里的默认值与校验逻辑，避免各入口规则漂移。
 */

export const STORAGE_SCHEMA_VERSION = 2;
export const LEGACY_DISABLED_SITES_KEY = 'disabledSites';

export const DEFAULT_SYNC_SETTINGS = Object.freeze(
{
  enabled: true,
  clickEnabled: true,
  trailEnabled: true,
  trailAlways: true,
  color: '#69a1ff',
  opacity: 0.5,
  scale: 1.1,
  quality: 'balanced',
  languageMode: 'system',
  motionMode: 'system',
  preset: 'classic',
});

export const DEFAULT_LOCAL_SETTINGS = Object.freeze(
{
  disabledSites: Object.freeze({}),
  storageSchemaVersion: STORAGE_SCHEMA_VERSION,
});

export const DEFAULT_SETTINGS = Object.freeze(
{
  ...DEFAULT_SYNC_SETTINGS,
  disabledSites: DEFAULT_LOCAL_SETTINGS.disabledSites,
});

export const SYNC_SETTING_KEYS = Object.freeze(Object.keys(DEFAULT_SYNC_SETTINGS));
export const LOCAL_SETTING_KEYS = Object.freeze(['disabledSites']);

export const APPEARANCE_PRESETS = Object.freeze(
{
  classic: Object.freeze(
  {
    color: '#69a1ff',
    opacity: 0.5,
    scale: 1.1,
    quality: 'balanced',
  }),
  soft: Object.freeze(
  {
    color: '#8edcff',
    opacity: 0.35,
    scale: 0.9,
    quality: 'balanced',
  }),
  performance: Object.freeze(
  {
    color: '#69a1ff',
    opacity: 0.45,
    scale: 1,
    quality: 'performance',
  }),
});

const QUALITY_PROFILES = Object.freeze(
{
  performance: Object.freeze(
  {
    maxDpr: 1,
  }),
  balanced: Object.freeze(
  {
    maxDpr: 1,
  }),
  high: Object.freeze(
  {
    maxDpr: 2,
  }),
});

const LANGUAGE_MODES = new Set(['system', 'zh_CN', 'en']);
const MOTION_MODES = new Set(['system', 'full', 'reduced']);
const PRESET_NAMES = new Set([...Object.keys(APPEARANCE_PRESETS), 'custom']);
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const MAX_SITE_KEY_LENGTH = 512;

function clamp(value, min, max, fallback)
{
  const number = Number(value);

  if (!Number.isFinite(number))
  {
    return fallback;
  }

  return Math.max(min, Math.min(max, number));
}

export function normalizeDisabledSites(value)
{
  const sites = {};

  if (!value || typeof value !== 'object' || Array.isArray(value))
  {
    return sites;
  }

  for (const [key, disabled] of Object.entries(value))
  {
    // 只持久化“已禁用”规则，减少 local storage 的体积和歧义。
    if (
      disabled === true &&
      typeof key === 'string' &&
      key.length > 0 &&
      key.length <= MAX_SITE_KEY_LENGTH
    )
    {
      sites[key] = true;
    }
  }

  return sites;
}

export function mergeDisabledSites(...values)
{
  return normalizeDisabledSites(Object.assign({}, ...values));
}

export function detectAppearancePreset(value)
{
  for (const [name, preset] of Object.entries(APPEARANCE_PRESETS))
  {
    if (
      value.color === preset.color &&
      value.opacity === preset.opacity &&
      value.scale === preset.scale &&
      value.quality === preset.quality
    )
    {
      return name;
    }
  }

  return 'custom';
}

export function normalizeSettings(value = {})
{
  const source = value && typeof value === 'object' ? value : {};
  const color = typeof source.color === 'string' && HEX_COLOR_PATTERN.test(source.color)
    ? source.color.toLowerCase()
    : DEFAULT_SETTINGS.color;
  const quality = Object.hasOwn(QUALITY_PROFILES, source.quality)
    ? source.quality
    : DEFAULT_SETTINGS.quality;
  const appearance =
  {
    color,
    opacity: clamp(source.opacity, 0.1, 1, DEFAULT_SETTINGS.opacity),
    scale: clamp(source.scale, 0.5, 2, DEFAULT_SETTINGS.scale),
    quality,
  };
  const inferredPreset = detectAppearancePreset(appearance);
  const preset = PRESET_NAMES.has(source.preset)
    ? source.preset
    : inferredPreset;

  return {
    enabled: source.enabled === undefined ? DEFAULT_SETTINGS.enabled : source.enabled === true,
    clickEnabled: source.clickEnabled === undefined
      ? DEFAULT_SETTINGS.clickEnabled
      : source.clickEnabled === true,
    trailEnabled: source.trailEnabled === undefined
      ? DEFAULT_SETTINGS.trailEnabled
      : source.trailEnabled === true,
    trailAlways: source.trailAlways === undefined
      ? DEFAULT_SETTINGS.trailAlways
      : source.trailAlways === true,
    ...appearance,
    languageMode: LANGUAGE_MODES.has(source.languageMode)
      ? source.languageMode
      : DEFAULT_SETTINGS.languageMode,
    motionMode: MOTION_MODES.has(source.motionMode)
      ? source.motionMode
      : DEFAULT_SETTINGS.motionMode,
    preset,
    disabledSites: normalizeDisabledSites(source.disabledSites),
  };
}

export function getQualityProfile(quality)
{
  return QUALITY_PROFILES[quality] || QUALITY_PROFILES[DEFAULT_SETTINGS.quality];
}

export function shouldReduceMotion(settings, systemPrefersReducedMotion)
{
  if (settings.motionMode === 'reduced')
  {
    return true;
  }

  if (settings.motionMode === 'full')
  {
    return false;
  }

  return systemPrefersReducedMotion === true;
}

export function getSiteKey(urlValue)
{
  try
  {
    const url = new URL(urlValue);

    if (url.protocol === 'http:' || url.protocol === 'https:')
    {
      return url.origin;
    }

    if (url.protocol === 'file:')
    {
      // 浏览器不会向扩展暴露可靠的本地目录权限边界，因此文件页共用一条规则。
      return 'file://';
    }
  }
  catch
  {
    return null;
  }

  return null;
}
