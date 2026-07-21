/**
 * 扩展设置的唯一数据模型。
 * 内容脚本、弹窗和设置页共用这里的默认值与校验逻辑，避免各入口规则漂移。
 */

import { normalizeFxParams } from './fx-settings.js';

export const STORAGE_SCHEMA_VERSION = 4;
export const LEGACY_DISABLED_SITES_KEY = 'disabledSites';

export const RENDER_MODE_PROFILES = Object.freeze(
{
  'software-bloom': Object.freeze(
  {
    renderingMode: 'enhanced',
    bloomBackend: 'software',
  }),
  'webgl2-bloom': Object.freeze(
  {
    renderingMode: 'enhanced',
    bloomBackend: 'webgl2',
  }),
  'native-bloom': Object.freeze(
  {
    renderingMode: 'enhanced',
    bloomBackend: 'native',
  }),
  legacy: Object.freeze(
  {
    renderingMode: 'legacy',
    bloomBackend: 'native',
  }),
});

const QUALITY_PROFILES = Object.freeze(
{
  balanced: Object.freeze({ renderMode: 'legacy', maxDpr: 1 }),
  high: Object.freeze({ renderMode: 'native-bloom', maxDpr: 2 }),
  ultra: Object.freeze({ renderMode: 'webgl2-bloom', maxDpr: 2 }),
});

export const DEFAULT_SYNC_SETTINGS = Object.freeze(
{
  enabled: true,
  clickEnabled: true,
  trailEnabled: true,
  trailAlways: false,
  color: '#69a1ff',
  opacity: 1,
  scale: 1,
  quality: 'ultra',
  renderMode: QUALITY_PROFILES.ultra.renderMode,
  maxDpr: QUALITY_PROFILES.ultra.maxDpr,
  fxParams: Object.freeze({}),
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
    opacity: 1,
    scale: 1,
    quality: 'ultra',
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
    quality: 'balanced',
  }),
});

const PREVIOUS_CLASSIC_DEFAULTS = Object.freeze(
{
  color: '#69a1ff',
  opacity: 0.5,
  scale: 1.1,
  quality: 'balanced',
  preset: 'classic',
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

function normalizeQuality(quality)
{
  if (quality === 'performance')
  {
    return 'balanced';
  }

  return quality === 'custom' || Object.hasOwn(QUALITY_PROFILES, quality)
    ? quality
    : DEFAULT_SETTINGS.quality;
}

export function getQualityProfile(quality)
{
  return QUALITY_PROFILES[quality] || QUALITY_PROFILES[DEFAULT_SETTINGS.quality];
}

export function detectQualityProfile(renderMode, maxDpr)
{
  for (const [quality, profile] of Object.entries(QUALITY_PROFILES))
  {
    if (profile.renderMode === renderMode && profile.maxDpr === maxDpr)
    {
      return quality;
    }
  }

  return 'custom';
}

export function getRenderModeProfile(renderMode)
{
  return RENDER_MODE_PROFILES[renderMode] ||
    RENDER_MODE_PROFILES[DEFAULT_SETTINGS.renderMode];
}

export function getQualitySettingsPatch(quality)
{
  const normalizedQuality = normalizeQuality(quality);
  const profile = QUALITY_PROFILES[normalizedQuality];

  if (!profile)
  {
    return { quality: 'custom' };
  }

  return {
    quality: normalizedQuality,
    ...profile,
  };
}

export function getQualityConsistencyPatch(value)
{
  const source = value && typeof value === 'object' ? value : {};
  const profilePatch = getQualitySettingsPatch(source.quality);

  if (profilePatch.quality === 'custom')
  {
    return {};
  }

  const patch = {};

  if (source.renderMode !== profilePatch.renderMode)
  {
    patch.renderMode = profilePatch.renderMode;
  }

  if (source.maxDpr !== profilePatch.maxDpr)
  {
    patch.maxDpr = profilePatch.maxDpr;
  }

  return patch;
}

export function getRenderDefaultsMigrationPatch(value)
{
  const source = value && typeof value === 'object' ? value : {};
  const quality = normalizeQuality(source.quality);
  const profile = QUALITY_PROFILES[quality] || QUALITY_PROFILES[DEFAULT_SETTINGS.quality];
  const patch = {};

  // 旧版本只有 quality；只补缺失字段，绝不覆盖已同步的高级设置。
  if (!Object.hasOwn(source, 'renderMode'))
  {
    patch.renderMode = profile.renderMode;
  }

  if (!Object.hasOwn(source, 'maxDpr'))
  {
    patch.maxDpr = profile.maxDpr;
  }

  return patch;
}

export function getClassicDefaultsMigrationPatch(value)
{
  const source = value && typeof value === 'object' ? value : {};
  const color = typeof source.color === 'string' ? source.color.toLowerCase() : '';
  const matchesPreviousDefaults = (
    source.preset === PREVIOUS_CLASSIC_DEFAULTS.preset &&
    color === PREVIOUS_CLASSIC_DEFAULTS.color &&
    source.opacity === PREVIOUS_CLASSIC_DEFAULTS.opacity &&
    source.scale === PREVIOUS_CLASSIC_DEFAULTS.scale &&
    source.quality === PREVIOUS_CLASSIC_DEFAULTS.quality
  );

  if (!matchesPreviousDefaults)
  {
    return {};
  }

  const patch =
  {
    ...APPEARANCE_PRESETS.classic,
    preset: PREVIOUS_CLASSIC_DEFAULTS.preset,
  };

  // 缺失表示沿用旧默认值；已存储的 true/false 都属于用户明确选择。
  if (!Object.hasOwn(source, 'trailAlways'))
  {
    patch.trailAlways = DEFAULT_SETTINGS.trailAlways;
  }

  return patch;
}

export function getSettingsMigrationPatch(value)
{
  const source = value && typeof value === 'object' ? value : {};
  const classicPatch = getClassicDefaultsMigrationPatch(source);
  const migratedSource = { ...source, ...classicPatch };

  return {
    ...classicPatch,
    ...getRenderDefaultsMigrationPatch(migratedSource),
  };
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
  const original = value && typeof value === 'object' ? value : {};
  const source = { ...original, ...getSettingsMigrationPatch(original) };
  const color = typeof source.color === 'string' && HEX_COLOR_PATTERN.test(source.color)
    ? source.color.toLowerCase()
    : DEFAULT_SETTINGS.color;
  const requestedQuality = normalizeQuality(source.quality);
  const fallbackProfile = getQualityProfile(requestedQuality);
  const appearance =
  {
    color,
    opacity: clamp(source.opacity, 0, 1, DEFAULT_SETTINGS.opacity),
    scale: clamp(source.scale, 0.01, 5, DEFAULT_SETTINGS.scale),
  };
  const requestedRenderMode = Object.hasOwn(RENDER_MODE_PROFILES, source.renderMode)
    ? source.renderMode
    : fallbackProfile.renderMode;
  const maxDpr = Math.round(clamp(source.maxDpr, 1, 3, fallbackProfile.maxDpr));
  const renderMode = requestedRenderMode;
  const quality = detectQualityProfile(renderMode, maxDpr);
  const inferredPreset = detectAppearancePreset({ ...appearance, quality });
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
    quality,
    renderMode,
    maxDpr,
    fxParams: normalizeFxParams(source.fxParams),
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
