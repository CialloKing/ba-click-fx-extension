import { BAClickFX } from 'ba-click-fx';
import {
  DEFAULT_SETTINGS,
  getQualityProfile,
  getSiteKey,
  shouldReduceMotion,
} from './shared/settings.js';
import {
  applyStorageChanges,
  readSettings,
} from './shared/storage.js';

const MESSAGE_GET_STATUS = 'BA_CLICK_FX_GET_STATUS';
const MESSAGE_PREVIEW = 'BA_CLICK_FX_PREVIEW';
const MESSAGE_PROTOCOL_VERSION = 2;
const ROOT_ATTRIBUTE = 'data-ba-click-fx-extension-root';
const siteKey = getSiteKey(window.location.href);
const reducedMotionQuery = typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

let currentSettings = DEFAULT_SETTINGS;
let engine = null;
let surface = null;
let appliedSettings = null;
let appliedQuality = null;
let appliedTrailAlways = null;
let initializationState = 'loading';
let initializationError = '';

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

function getEffectiveTrailAlways(settings)
{
  return Boolean(
    settings.trailEnabled &&
    settings.trailAlways &&
    !shouldReduceMotion(settings, reducedMotionQuery?.matches),
  );
}

function applySettings(settings)
{
  if (!engine)
  {
    return;
  }

  if (!appliedSettings || appliedSettings.color !== settings.color)
  {
    engine.setThemeColor(settings.color);
  }

  const nextTrailAlways = getEffectiveTrailAlways(settings);
  const updates = {};

  if (!appliedSettings || appliedSettings.opacity !== settings.opacity)
  {
    updates.opacity = settings.opacity;
  }

  if (!appliedSettings || appliedSettings.scale !== settings.scale)
  {
    updates.scale = settings.scale;
  }

  if (!appliedSettings || appliedSettings.clickEnabled !== settings.clickEnabled)
  {
    updates.clickEnabled = settings.clickEnabled;
  }

  if (!appliedSettings || appliedSettings.trailEnabled !== settings.trailEnabled)
  {
    // v1.2.x 关闭 trailEnabled 时会自动释放拖尾输入、轨迹和粒子。
    updates.trailEnabled = settings.trailEnabled;
  }

  if (appliedTrailAlways !== nextTrailAlways)
  {
    updates.trailAlways = nextTrailAlways;
    appliedTrailAlways = nextTrailAlways;
  }

  if (Object.keys(updates).length > 0)
  {
    engine.updateConfig(updates);
  }

  if (appliedQuality !== settings.quality)
  {
    // v1.2.x 仅 maxDpr 可控；trailRenderScale 已移除，质量档位降级。
    const profile = getQualityProfile(settings.quality);

    engine.updateConfig({ maxDpr: profile.maxDpr });
    appliedQuality = settings.quality;
  }

  appliedSettings = settings;
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
    // 构造时直接传入预算，避免先按默认尺寸分配再二次缩放的瞬时内存峰值。
    engine = new BAClickFX(
    {
      target: surface.canvas,
      scale: currentSettings.scale,
      opacity: currentSettings.opacity,
      trailEnabled: currentSettings.trailEnabled,
      trailAlways: getEffectiveTrailAlways(currentSettings),
      clickEnabled: currentSettings.clickEnabled,
      maxDpr: getQualityProfile(currentSettings.quality).maxDpr,
    });
    appliedQuality = currentSettings.quality;
    appliedTrailAlways = getEffectiveTrailAlways(currentSettings);
    appliedSettings = null;
    applySettings(currentSettings);
  }
  catch (error)
  {
    if (engine)
    {
      engine.destroy();
      engine = null;
    }

    appliedSettings = null;
    appliedQuality = null;
    appliedTrailAlways = null;

    surface.host.remove();
    surface = null;
    throw error;
  }
}

function destroyEngine()
{
  if (engine)
  {
    engine.destroy();
    engine = null;
  }

  appliedSettings = null;
  appliedQuality = null;
  appliedTrailAlways = null;

  if (surface)
  {
    // target 模式下核心引擎保留调用方 Canvas，由适配层移除整个隔离宿主。
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
  initializationState = 'error';
  initializationError = error instanceof Error ? error.message : String(error);
  // 控制台信息仅用于定位宿主页 Canvas/权限异常，不包含浏览数据。
  console.warn('[BA Click FX] 初始化失败：', error);
}

chrome.storage.onChanged.addListener((changes, areaName) =>
{
  if (areaName !== 'sync' && areaName !== 'local')
  {
    return;
  }

  const nextSettings = applyStorageChanges(currentSettings, changes, areaName);

  if (nextSettings === currentSettings)
  {
    return;
  }

  currentSettings = nextSettings;

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
      protocolVersion: MESSAGE_PROTOCOL_VERSION,
      state: initializationState,
      error: initializationError,
      active: Boolean(engine),
      siteKey,
    });
    return;
  }

  if (message?.type === MESSAGE_PREVIEW)
  {
    if (initializationState !== 'ready')
    {
      sendResponse({ ok: false, reason: initializationState });
    }
    else if (engine && currentSettings.clickEnabled)
    {
      engine.boom();
      sendResponse({ ok: true });
    }
    else
    {
      sendResponse({ ok: false, reason: 'click-disabled' });
    }
  }
});

document.addEventListener('visibilitychange', () =>
{
  try
  {
    // 后台标签页释放全部 Canvas；再次可见时按最新设置重建。
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

const handleMotionPreferenceChange = () =>
{
  try
  {
    applySettings(currentSettings);
  }
  catch (error)
  {
    reportError(error);
  }
};

if (typeof reducedMotionQuery?.addEventListener === 'function')
{
  reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
}
else if (typeof reducedMotionQuery?.addListener === 'function')
{
  // Chrome 102 之前的兼容 API 仍可能出现在部分 Chromium 分支中。
  reducedMotionQuery.addListener(handleMotionPreferenceChange);
}

readSettings()
  .then((settings) =>
  {
    currentSettings = settings;
    reconcile();
    initializationState = 'ready';
    initializationError = '';
  })
  .catch(reportError);
