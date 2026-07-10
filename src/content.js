import { BAClickFX } from 'ba-click-fx';
import {
  DEFAULT_SETTINGS,
  getEffectiveMaxDpr,
  getQualityProfile,
  getSiteKey,
  hexToRgb,
  normalizeSettings,
} from './shared/settings.js';

const MESSAGE_GET_STATUS = 'BA_CLICK_FX_GET_STATUS';
const MESSAGE_PREVIEW = 'BA_CLICK_FX_PREVIEW';
const ROOT_ATTRIBUTE = 'data-ba-click-fx-extension-root';
const siteKey = getSiteKey(window.location.href);

let currentSettings = normalizeSettings(DEFAULT_SETTINGS);
let engine = null;
let surface = null;
let appliedSettings = null;
let appliedMaxDpr = null;
let appliedTrailRenderScale = null;
let defaultTrailMaxShards = 38;
let ready = false;

function readSettings()
{
  return new Promise((resolve, reject) =>
  {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) =>
    {
      const error = chrome.runtime.lastError;

      if (error)
      {
        reject(new Error(error.message));
        return;
      }

      resolve(normalizeSettings(stored));
    });
  });
}

function setImportantStyle(element, property, value)
{
  element.style.setProperty(property, value, 'important');
}

function createSurface()
{
  const host = document.createElement('div');

  host.setAttribute(ROOT_ATTRIBUTE, '');
  host.setAttribute('aria-hidden', 'true');
  setImportantStyle(host, 'all', 'initial');
  setImportantStyle(host, 'position', 'fixed');
  setImportantStyle(host, 'inset', '0');
  setImportantStyle(host, 'display', 'block');
  setImportantStyle(host, 'width', '100vw');
  setImportantStyle(host, 'height', '100vh');
  setImportantStyle(host, 'overflow', 'hidden');
  setImportantStyle(host, 'pointer-events', 'none');
  setImportantStyle(host, 'z-index', '2147483647');
  setImportantStyle(host, 'contain', 'strict');

  const shadowRoot = host.attachShadow({ mode: 'closed' });
  const canvas = document.createElement('canvas');

  canvas.setAttribute('aria-hidden', 'true');
  setImportantStyle(canvas, 'position', 'absolute');
  setImportantStyle(canvas, 'inset', '0');
  setImportantStyle(canvas, 'display', 'block');
  setImportantStyle(canvas, 'width', '100%');
  setImportantStyle(canvas, 'height', '100%');
  setImportantStyle(canvas, 'pointer-events', 'none');
  setImportantStyle(canvas, 'touch-action', 'auto');

  shadowRoot.appendChild(canvas);

  const parent = document.documentElement || document.body;

  if (!parent)
  {
    throw new Error('页面尚未提供可挂载的根元素。');
  }

  parent.appendChild(host);

  return {
    host,
    canvas,
  };
}

function applySettings(settings)
{
  if (!engine)
  {
    return;
  }

  const quality = getQualityProfile(settings.quality);
  const effectiveMaxDpr = getEffectiveMaxDpr(
    settings.quality,
    window.innerWidth,
    window.innerHeight,
    window.screen?.availWidth || window.innerWidth,
    window.screen?.availHeight || window.innerHeight,
  );
  const [red, green, blue] = hexToRgb(settings.color);

  if (!appliedSettings || appliedSettings.color !== settings.color)
  {
    engine.setColor(red, green, blue);
  }

  if (!appliedSettings || appliedSettings.opacity !== settings.opacity)
  {
    engine.setOpacity(settings.opacity);
  }

  if (!appliedSettings || appliedSettings.scale !== settings.scale)
  {
    engine.setScale(settings.scale);
  }

  if (!appliedSettings || appliedSettings.clickEnabled !== settings.clickEnabled)
  {
    engine.setClick(settings.clickEnabled);
  }

  if (!appliedSettings || appliedSettings.trailEnabled !== settings.trailEnabled)
  {
    engine.setTrail(settings.trailEnabled);
    engine.setMaxShards(settings.trailEnabled ? defaultTrailMaxShards : 0);

    if (!settings.trailEnabled)
    {
      // 上游仍会在按住鼠标时采样禁用的拖尾；立即收尾以避免隐藏轨迹占用资源。
      engine.isDown = false;
      engine.clearTrail();
    }
  }

  const trailAlways = settings.trailEnabled && settings.trailAlways;
  const previousTrailAlways = appliedSettings
    ? appliedSettings.trailEnabled && appliedSettings.trailAlways
    : null;

  if (previousTrailAlways !== trailAlways)
  {
    // 核心的 trailAlways 独立于 trail.enabled，关闭拖尾时必须同步关闭常驻采样。
    engine.setTrailAlways(trailAlways);
  }

  if (appliedTrailRenderScale !== quality.trailRenderScale)
  {
    // 画质 setter 会重分配 Canvas，只在对应参数变化时执行。
    engine.setTrailRenderScale(quality.trailRenderScale);
  }

  if (appliedMaxDpr !== effectiveMaxDpr)
  {
    engine.setDpr(effectiveMaxDpr);
  }

  appliedSettings = settings;
  appliedMaxDpr = effectiveMaxDpr;
  appliedTrailRenderScale = quality.trailRenderScale;
}

function createEngine()
{
  if (engine)
  {
    applySettings(currentSettings);
    return;
  }

  surface = createSurface();

  try
  {
    // 显式传入插件专属 Canvas，避免复用宿主页同名的 #sparkCanvas。
    engine = new BAClickFX({ target: surface.canvas });
    const initialConfig = engine.getConfig();

    defaultTrailMaxShards = initialConfig.trail.maxSparkParticles;
    appliedMaxDpr = initialConfig.maxDpr;
    appliedTrailRenderScale = initialConfig.trailRenderScale;
    applySettings(currentSettings);
    // 核心先处理点击以保留圆环，再由适配层阻止禁用状态下继续采样拖尾。
    window.addEventListener('pointerdown', stopDisabledTrailInput, { passive: true });
  }
  catch (error)
  {
    if (engine)
    {
      engine.destroy();
      engine = null;
    }

    appliedSettings = null;
    appliedMaxDpr = null;
    appliedTrailRenderScale = null;

    surface.host.remove();
    surface = null;
    throw error;
  }
}

function stopDisabledTrailInput()
{
  if (!engine || currentSettings.trailEnabled)
  {
    return;
  }

  // ba-click-fx 暂无“关闭输入采样”的公开 API，这里只复位其按压状态并调用公开清理 API。
  engine.isDown = false;
  engine.clearTrail();
}

function destroyEngine()
{
  window.removeEventListener('pointerdown', stopDisabledTrailInput);

  if (engine)
  {
    engine.destroy();
    engine = null;
  }

  appliedSettings = null;
  appliedMaxDpr = null;
  appliedTrailRenderScale = null;

  if (surface)
  {
    // target 模式下核心引擎不会删除外部 Canvas，由适配层负责完整清理。
    surface.host.remove();
    surface = null;
  }
}

function shouldEnable(settings)
{
  return Boolean(
    siteKey &&
    document.visibilityState !== 'hidden' &&
    settings.enabled &&
    (settings.clickEnabled || settings.trailEnabled) &&
    settings.disabledSites[siteKey] !== true,
  );
}

function reconcile()
{
  if (shouldEnable(currentSettings))
  {
    createEngine();
  }
  else
  {
    destroyEngine();
  }
}

function reportError(error)
{
  // 控制台信息仅用于定位宿主页 Canvas/权限异常，不包含浏览数据。
  console.warn('[BA Click FX] 初始化失败：', error);
}

chrome.storage.onChanged.addListener((changes, areaName) =>
{
  if (areaName !== 'sync')
  {
    return;
  }

  const next = { ...currentSettings };

  for (const [key, change] of Object.entries(changes))
  {
    if (Object.hasOwn(DEFAULT_SETTINGS, key))
    {
      next[key] = change.newValue;
    }
  }

  currentSettings = normalizeSettings(next);

  try
  {
    reconcile();
  }
  catch (error)
  {
    reportError(error);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) =>
{
  if (message?.type === MESSAGE_GET_STATUS)
  {
    sendResponse(
    {
      ready,
      active: Boolean(engine),
      siteKey,
    });
    return;
  }

  if (message?.type === MESSAGE_PREVIEW)
  {
    if (engine && currentSettings.clickEnabled)
    {
      engine.boom();
      sendResponse({ ok: true });
    }
    else
    {
      sendResponse({ ok: false });
    }
  }
});

document.addEventListener('visibilitychange', () =>
{
  try
  {
    // 后台标签页释放双 Canvas；再次可见时按最新设置重建。
    reconcile();
  }
  catch (error)
  {
    reportError(error);
  }
});

window.addEventListener('pageshow', () =>
{
  // BFCache 恢复不一定重新执行内容脚本，pageshow 负责补一次状态协调。
  try
  {
    reconcile();
  }
  catch (error)
  {
    reportError(error);
  }
});

readSettings()
  .then((settings) =>
  {
    currentSettings = settings;
    reconcile();
    ready = true;
  })
  .catch(reportError);
