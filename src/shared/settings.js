/**
 * 扩展设置的唯一数据模型。
 * 内容脚本、弹窗和设置页共用这里的默认值与校验逻辑，避免各入口规则漂移。
 */

import { DEFAULT_THEME_COLOR } from 'ba-click-fx';
import {
  FX_PARAM_SCHEMA_VERSION,
  normalizeFxParams,
} from './fx-settings.js';

export const STORAGE_SCHEMA_VERSION = 5;
export const LEGACY_DISABLED_SITES_KEY = 'disabledSites';
const MIN_TIME_SCALE = 0.01;

export const RENDER_MODE_PROFILES = Object.freeze(
{
  'full-webgpu': Object.freeze(
  {
    effectBackend: 'webgpu',
    renderingMode: 'enhanced',
    bloomBackend: 'webgl2',
  }),
  'full-webgl2': Object.freeze(
  {
    effectBackend: 'webgl2',
    renderingMode: 'enhanced',
    bloomBackend: 'webgl2',
  }),
  'software-bloom': Object.freeze(
  {
    effectBackend: 'canvas2d',
    renderingMode: 'enhanced',
    bloomBackend: 'software',
  }),
  'webgl2-bloom': Object.freeze(
  {
    effectBackend: 'canvas2d',
    renderingMode: 'enhanced',
    bloomBackend: 'webgl2',
  }),
  'native-bloom': Object.freeze(
  {
    effectBackend: 'canvas2d',
    renderingMode: 'enhanced',
    bloomBackend: 'native',
  }),
  legacy: Object.freeze(
  {
    effectBackend: 'canvas2d',
    renderingMode: 'legacy',
    bloomBackend: 'native',
  }),
});

export const DEFAULT_SYNC_SETTINGS = Object.freeze(
{
  enabled: true,
  clickEnabled: true,
  trailEnabled: true,
  trailAlways: false,
  color: DEFAULT_THEME_COLOR,
  opacity: 1,
  scale: 1,
  renderMode: 'full-webgl2',
  maxDpr: 2,
  // 固定扩展自己的核心 HDR 基线，不继承上游展示页的演示预设。
  webgpuHdrPeak: 3,
  webgpuHdrBrightness: 1,
  webgpuHdrColorPreservation: 0,
  webgpuHdrWhiteCore: 0.6,
  webgpuHdrWhiteStart: 1,
  webgpuHdrWhiteEnd: 5,
  fxParams: Object.freeze({}),
  fxParamSchemaVersion: FX_PARAM_SCHEMA_VERSION,
  clickTimeScale: 1,
  trailTimeScale: 1,
  // 扩展面对的是无法逐像素采样的任意网页；DOM Add 用 Screen 在亮底上收敛增量。
  outputCompositing: 'browser-overlay',
  overlayAlphaPolicy: 'coverage',
  overlayColorCompensation: 'none',
  overlayAlphaLimit: 250 / 255,
  hostCompositing: 'screen',
  isolatedCompositing: false,
  lightBackgroundContrastAlpha: 0,
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
    color: DEFAULT_THEME_COLOR,
    opacity: 1,
    scale: 1,
    renderMode: 'full-webgl2',
    maxDpr: 2,
  }),
  'light-background': Object.freeze(
  {
    color: DEFAULT_THEME_COLOR,
    opacity: 1,
    scale: 1,
    renderMode: 'full-webgl2',
    maxDpr: 2,
  }),
  soft: Object.freeze(
  {
    color: '#8edcff',
    opacity: 0.35,
    scale: 0.9,
    renderMode: 'legacy',
    maxDpr: 1,
  }),
  performance: Object.freeze(
  {
    color: DEFAULT_THEME_COLOR,
    opacity: 0.45,
    scale: 1,
    renderMode: 'legacy',
    maxDpr: 1,
  }),
});

const DEFAULT_PRESET_COMPOSITING = Object.freeze(
{
  outputCompositing: DEFAULT_SYNC_SETTINGS.outputCompositing,
  overlayAlphaPolicy: DEFAULT_SYNC_SETTINGS.overlayAlphaPolicy,
  overlayColorCompensation: DEFAULT_SYNC_SETTINGS.overlayColorCompensation,
  overlayAlphaLimit: DEFAULT_SYNC_SETTINGS.overlayAlphaLimit,
  hostCompositing: DEFAULT_SYNC_SETTINGS.hostCompositing,
  isolatedCompositing: DEFAULT_SYNC_SETTINGS.isolatedCompositing,
  lightBackgroundContrastAlpha: DEFAULT_SYNC_SETTINGS.lightBackgroundContrastAlpha,
});

const APPEARANCE_PRESET_OVERRIDES = Object.freeze(
{
  'light-background': Object.freeze(
  {
    outputCompositing: 'browser-overlay',
    overlayAlphaPolicy: 'visual-max',
    overlayColorCompensation: 'none',
    overlayAlphaLimit: 0.85,
    hostCompositing: 'source-over',
  }),
});

const LANGUAGE_MODES = new Set(['system', 'zh_CN', 'en']);
const MOTION_MODES = new Set(['system', 'full', 'reduced']);
const OUTPUT_COMPOSITING_MODES = new Set(['scene', 'browser-overlay']);
const OVERLAY_ALPHA_POLICIES = new Set(['coverage', 'visual-max']);
const OVERLAY_COLOR_COMPENSATIONS = new Set(['none', 'bright-core']);
// 核心 v1.2.19 提供 screen；保留它可避免有效的同步设置被降级为默认混合模式。
const HOST_COMPOSITING_MODES = new Set([
  'source-over',
  'screen',
  'plus-lighter',
]);
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

function normalizeWebGPUHdrSettings(source)
{
  const webgpuHdrWhiteStart = clamp(
    source.webgpuHdrWhiteStart,
    0,
    15.99,
    DEFAULT_SETTINGS.webgpuHdrWhiteStart,
  );
  const requestedWhiteEnd = clamp(
    source.webgpuHdrWhiteEnd,
    0.01,
    16,
    DEFAULT_SETTINGS.webgpuHdrWhiteEnd,
  );

  // 与核心保留同一个 0.01 最小区间，避免 HDR smoothstep 起止点退化。
  return {
    webgpuHdrPeak: clamp(
      source.webgpuHdrPeak,
      2,
      4,
      DEFAULT_SETTINGS.webgpuHdrPeak,
    ),
    webgpuHdrBrightness: clamp(
      source.webgpuHdrBrightness,
      0,
      32,
      DEFAULT_SETTINGS.webgpuHdrBrightness,
    ),
    webgpuHdrColorPreservation: clamp(
      source.webgpuHdrColorPreservation,
      0,
      1,
      DEFAULT_SETTINGS.webgpuHdrColorPreservation,
    ),
    webgpuHdrWhiteCore: clamp(
      source.webgpuHdrWhiteCore,
      0,
      1,
      DEFAULT_SETTINGS.webgpuHdrWhiteCore,
    ),
    webgpuHdrWhiteStart,
    webgpuHdrWhiteEnd: Math.max(webgpuHdrWhiteStart + 0.01, requestedWhiteEnd),
  };
}

function normalizeCompositingSettings(source)
{
  return {
    outputCompositing: source.outputCompositing === 'transparent-overlay'
      ? 'browser-overlay'
      : OUTPUT_COMPOSITING_MODES.has(source.outputCompositing)
        ? source.outputCompositing
        : DEFAULT_SETTINGS.outputCompositing,
    overlayAlphaPolicy: OVERLAY_ALPHA_POLICIES.has(source.overlayAlphaPolicy)
      ? source.overlayAlphaPolicy
      : DEFAULT_SETTINGS.overlayAlphaPolicy,
    overlayColorCompensation: OVERLAY_COLOR_COMPENSATIONS.has(
      source.overlayColorCompensation,
    )
      ? source.overlayColorCompensation
      : DEFAULT_SETTINGS.overlayColorCompensation,
    overlayAlphaLimit: clamp(
      source.overlayAlphaLimit,
      0,
      1,
      DEFAULT_SETTINGS.overlayAlphaLimit,
    ),
    hostCompositing: HOST_COMPOSITING_MODES.has(source.hostCompositing)
      ? source.hostCompositing
      : DEFAULT_SETTINGS.hostCompositing,
    isolatedCompositing: source.isolatedCompositing === undefined
      ? DEFAULT_SETTINGS.isolatedCompositing
      : source.isolatedCompositing === true,
    lightBackgroundContrastAlpha: clamp(
      source.lightBackgroundContrastAlpha,
      0,
      1,
      DEFAULT_SETTINGS.lightBackgroundContrastAlpha,
    ),
  };
}

export function getRenderModeProfile(renderMode)
{
  return RENDER_MODE_PROFILES[renderMode] ||
    RENDER_MODE_PROFILES[DEFAULT_SETTINGS.renderMode];
}

export function getAppearancePresetPatch(name)
{
  const preset = APPEARANCE_PRESETS[name];

  if (!preset)
  {
    return { preset: 'custom' };
  }

  // 效果预设直接携带渲染与 DPR，不再维护第二套画质档位状态。
  return {
    ...DEFAULT_PRESET_COMPOSITING,
    ...preset,
    ...(APPEARANCE_PRESET_OVERRIDES[name] || {}),
    preset: name,
  };
}

export function getSettingsMigrationPatch(value)
{
  const source = value && typeof value === 'object' ? value : {};
  const compositingPatch = {};
  const hasCompositingContract = [
    'outputCompositing',
    'overlayAlphaPolicy',
    'overlayColorCompensation',
    'overlayAlphaLimit',
    'hostCompositing',
  ].some((key) => Object.hasOwn(source, key));

  // 1.2.17 将透明覆盖层拆成独立合同；旧值只在读取迁移时转换，
  // 避免后续同步设备继续写回已删除的 transparent-overlay 名称。
  if (hasCompositingContract && source.outputCompositing === 'transparent-overlay')
  {
    compositingPatch.outputCompositing = 'browser-overlay';
  }
  else if (hasCompositingContract && !Object.hasOwn(source, 'outputCompositing'))
  {
    compositingPatch.outputCompositing = DEFAULT_SETTINGS.outputCompositing;
  }

  if (hasCompositingContract)
  {
    for (const [key, fallback] of [
      ['overlayAlphaPolicy', DEFAULT_SETTINGS.overlayAlphaPolicy],
      ['overlayColorCompensation', DEFAULT_SETTINGS.overlayColorCompensation],
      ['overlayAlphaLimit', DEFAULT_SETTINGS.overlayAlphaLimit],
      ['hostCompositing', DEFAULT_SETTINGS.hostCompositing],
    ])
    {
      if (!Object.hasOwn(source, key))
      {
        compositingPatch[key] = fallback;
      }
    }
  }

  return {
    ...compositingPatch,
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
  for (const name of Object.keys(APPEARANCE_PRESETS))
  {
    const patch = getAppearancePresetPatch(name);
    const matches = Object.entries(patch).every(([key, expected]) =>
      key === 'preset' || value[key] === expected);

    if (matches)
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
  const appearance =
  {
    color,
    opacity: clamp(source.opacity, 0, 1, DEFAULT_SETTINGS.opacity),
    scale: clamp(source.scale, 0.01, 5, DEFAULT_SETTINGS.scale),
  };
  const renderMode = Object.hasOwn(RENDER_MODE_PROFILES, source.renderMode)
    ? source.renderMode
    : DEFAULT_SETTINGS.renderMode;
  const maxDpr = clamp(source.maxDpr, 1, 3, DEFAULT_SETTINGS.maxDpr);
  const compositing = normalizeCompositingSettings(source);
  const preset = detectAppearancePreset(
  {
    ...appearance,
    renderMode,
    maxDpr,
    ...compositing,
  });

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
    renderMode,
    maxDpr,
    ...normalizeWebGPUHdrSettings(source),
    fxParams: normalizeFxParams(source.fxParams,
    {
      schemaVersion: source.fxParamSchemaVersion === 0
        ? 0
        : FX_PARAM_SCHEMA_VERSION,
    }),
    fxParamSchemaVersion: FX_PARAM_SCHEMA_VERSION,
    clickTimeScale: clamp(
      source.clickTimeScale,
      MIN_TIME_SCALE,
      4,
      DEFAULT_SETTINGS.clickTimeScale,
    ),
    trailTimeScale: clamp(
      source.trailTimeScale,
      MIN_TIME_SCALE,
      4,
      DEFAULT_SETTINGS.trailTimeScale,
    ),
    ...compositing,
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
