/**
 * 插件设置的唯一数据模型。
 * 内容脚本和弹窗共用这里的默认值与校验逻辑，避免两端规则漂移。
 */

export const DEFAULT_SETTINGS = Object.freeze(
{
  enabled: true,
  clickEnabled: true,
  trailEnabled: true,
  trailAlways: true,
  color: '#69a1ff',
  opacity: 0.5,
  scale: 1.1,
  quality: 'balanced',
  disabledSites: Object.freeze({}),
});

const QUALITY_PROFILES = Object.freeze(
{
  performance: Object.freeze(
  {
    maxDpr: 1,
    trailRenderScale: 0.6,
  }),
  balanced: Object.freeze(
  {
    maxDpr: 1,
    trailRenderScale: 0.8,
  }),
  high: Object.freeze(
  {
    maxDpr: 2,
    trailRenderScale: 1,
  }),
});

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const MAX_SITE_KEY_LENGTH = 512;
const MAX_RENDER_PIXEL_LAYERS = 20_000_000;

function clamp(value, min, max, fallback)
{
  const number = Number(value);

  if (!Number.isFinite(number))
  {
    return fallback;
  }

  return Math.max(min, Math.min(max, number));
}

function normalizeDisabledSites(value)
{
  const sites = {};

  if (!value || typeof value !== 'object' || Array.isArray(value))
  {
    return sites;
  }

  for (const [key, disabled] of Object.entries(value))
  {
    // 只持久化“已禁用”规则，减少 sync storage 的体积和歧义。
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

export function normalizeSettings(value = {})
{
  const source = value && typeof value === 'object' ? value : {};
  const color = typeof source.color === 'string' && HEX_COLOR_PATTERN.test(source.color)
    ? source.color.toLowerCase()
    : DEFAULT_SETTINGS.color;
  const quality = Object.hasOwn(QUALITY_PROFILES, source.quality)
    ? source.quality
    : DEFAULT_SETTINGS.quality;

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
    color,
    opacity: clamp(source.opacity, 0.1, 1, DEFAULT_SETTINGS.opacity),
    scale: clamp(source.scale, 0.5, 2, DEFAULT_SETTINGS.scale),
    quality,
    disabledSites: normalizeDisabledSites(source.disabledSites),
  };
}

export function getQualityProfile(quality)
{
  return QUALITY_PROFILES[quality] || QUALITY_PROFILES[DEFAULT_SETTINGS.quality];
}

export function getEffectiveMaxDpr(
  quality,
  viewportWidth,
  viewportHeight,
  screenWidth = viewportWidth,
  screenHeight = viewportHeight,
)
{
  const profile = getQualityProfile(quality);
  const normalizeDimension = (value) =>
  {
    const number = Number(value);

    return Number.isFinite(number) && number > 0 ? number : 1;
  };
  const viewportPixels = normalizeDimension(viewportWidth) * normalizeDimension(viewportHeight);
  const screenPixels = normalizeDimension(screenWidth) * normalizeDimension(screenHeight);
  const cssPixels = Math.max(viewportPixels, screenPixels);
  const layerMultiplier = 1 + profile.trailRenderScale ** 2;
  const budgetDpr = Math.sqrt(MAX_RENDER_PIXEL_LAYERS / (cssPixels * layerMultiplier));

  // 核心当前把 1 作为最小 DPR；这里主要限制高画质在 2K/4K 屏幕上的显存峰值。
  return Math.max(1, Math.min(profile.maxDpr, budgetDpr));
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
      // 浏览器不会向插件暴露可靠的本地目录权限边界，因此文件页共用一条规则。
      return 'file://';
    }
  }
  catch
  {
    return null;
  }

  return null;
}

export function hexToRgb(hex)
{
  const normalized = HEX_COLOR_PATTERN.test(hex) ? hex : DEFAULT_SETTINGS.color;
  const value = Number.parseInt(normalized.slice(1), 16);

  return [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ];
}
