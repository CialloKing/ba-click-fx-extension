import { BAClickFX } from 'ba-click-fx';
import {
  DEFAULT_SETTINGS,
  getRenderModeProfile,
  getSiteKey,
  shouldReduceMotion,
} from './shared/settings.js';
import {
  expandFxParams,
} from './shared/fx-settings.js';
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
  const container = document.createElement('div');

  container.setAttribute('aria-hidden', 'true');
  setImportantStyle(container, 'position', 'absolute');
  setImportantStyle(container, 'inset', '0');
  setImportantStyle(container, 'display', 'block');
  setImportantStyle(container, 'width', '100%');
  setImportantStyle(container, 'height', '100%');
  setImportantStyle(container, 'overflow', 'hidden');
  setImportantStyle(container, 'pointer-events', 'none');

  // 让核心拥有内部 Canvas，才能按渲染模式创建独立的加色层与浅色背景对比层。
  shadowRoot.appendChild(container);

  const parent = document.documentElement || document.body;

  if (!parent)
  {
    throw new Error('页面尚未提供可挂载的根元素。');
  }

  parent.appendChild(host);

  return {
    host,
    container,
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

function getRenderProfile(settings)
{
  return {
    ...getRenderModeProfile(settings.renderMode),
    maxDpr: settings.maxDpr,
  };
}

function requiresEngineRebuild(previous, next)
{
  return Boolean(
    previous &&
    previous.renderMode !== next.renderMode &&
    (previous.renderMode === 'legacy' || next.renderMode === 'legacy'),
  );
}

function hasSameFxParams(previous, next)
{
  const previousEntries = Object.entries(previous?.fxParams || {});
  const nextParams = next.fxParams || {};

  if (previousEntries.length !== Object.keys(nextParams).length)
  {
    return false;
  }

  return previousEntries.every(([path, value]) => nextParams[path] === value);
}

function applyFxParam(path, value)
{
  if (path === 'rings.rotationDirection' && value < 0)
  {
    // 上游 1.2.7 会把负方向钳制为 0；只有 -1 默认值有效，非法负覆盖已在共享层规范化。
    return;
  }

  engine.setFxParam(path, value);
}

function applyFxParams(settings)
{
  const renderProfile = getRenderProfile(settings);

  // 切到 Legacy 时 updateConfig 会写入该模式的资源映射；先切模式，再重置并重放。
  engine.updateConfig(renderProfile);
  engine.resetFxConfig();

  if (renderProfile.renderingMode === 'legacy')
  {
    // 上游只有发生 enhanced→legacy 切换时才应用 Legacy 映射，因此重复切一次来确定重置后的基线。
    engine.updateConfig({ ...renderProfile, renderingMode: 'enhanced' });
    engine.updateConfig(renderProfile);
  }

  const overrides = expandFxParams(settings.fxParams);

  for (const [path, value] of Object.entries(overrides))
  {
    // rootDurationMs 在上游 1.2.7 中尚无运行时读取点，但仍转交以保持公开 API 契约。
    applyFxParam(path, value);
  }
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
  const renderProfileChanged = Boolean(
    !appliedSettings ||
    appliedSettings.renderMode !== settings.renderMode ||
    appliedSettings.maxDpr !== settings.maxDpr,
  );
  const fxParamsChanged = !hasSameFxParams(appliedSettings, settings);

  if (renderProfileChanged || fxParamsChanged)
  {
    applyFxParams(settings);
  }

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

  appliedSettings = settings;
}

function createEngine()
{
  if (engine)
  {
    if (requiresEngineRebuild(appliedSettings, currentSettings))
    {
      // Legacy 与增强模式使用不同的 Canvas 层拓扑；重建可保证渲染层与参数基线一致。
      destroyEngine();
    }
    else
    {
      applySettings(currentSettings);
      return;
    }
  }

  surface = createSurface();

  try
  {
    const renderProfile = getRenderProfile(currentSettings);

    // 构造时直接传入渲染模式与 DPR，避免先按默认模式分配再切换的瞬时开销。
    engine = new BAClickFX(
    {
      target: surface.container,
      scale: currentSettings.scale,
      opacity: currentSettings.opacity,
      trailEnabled: currentSettings.trailEnabled,
      trailAlways: getEffectiveTrailAlways(currentSettings),
      clickEnabled: currentSettings.clickEnabled,
      ...renderProfile,
    });
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
  appliedTrailAlways = null;

  if (surface)
  {
    // 核心会移除自己创建的 Canvas；适配层只负责清理隔离宿主。
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
