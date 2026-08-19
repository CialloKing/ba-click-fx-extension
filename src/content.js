import {
  BAClickFX,
  BLOOM_BACKEND_CHANGE_EVENT,
  EFFECT_BACKEND_CHANGE_EVENT,
  HOST_COMPOSITING_CHANGE_EVENT,
} from 'ba-click-fx';
import {
  DEFAULT_SETTINGS,
  getRenderModeProfile,
  getSiteKey,
  shouldReduceMotion,
} from './shared/settings.js';
import { FX_PARAM_SCHEMA_VERSION } from './shared/fx-settings.js';
import { getSurfaceBlendMode } from './shared/compositing.js';
import {
  applyStorageChanges,
  readSettings,
} from './shared/storage.js';

const MESSAGE_GET_STATUS = 'BA_CLICK_FX_GET_STATUS';
const MESSAGE_PREVIEW = 'BA_CLICK_FX_PREVIEW';
const MESSAGE_PROTOCOL_VERSION = 3;
const ROOT_ATTRIBUTE = 'data-ba-click-fx-extension-root';
const siteKey = getSiteKey(window.location.href);
const reducedMotionQuery = typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

let currentSettings = DEFAULT_SETTINGS;
let engine = null;
let surface = null;
let appliedSettings = null;
let backendStatus = null;
let initializationState = 'loading';
let initializationError = '';

function setImportantStyle(element, property, value)
{
  element.style.setProperty(property, value, 'important');
}

function applySurfaceCompositing(targetSurface, instance)
{
  setImportantStyle(
    targetSurface.host,
    'mix-blend-mode',
    getSurfaceBlendMode(instance.getEffectiveHostCompositing()),
  );
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

function getEngineOptions(settings)
{
  return {
    scale: settings.scale,
    opacity: settings.opacity,
    themeColor: settings.color,
    clickEnabled: settings.clickEnabled,
    trailEnabled: settings.trailEnabled,
    trailAlways: getEffectiveTrailAlways(settings),
    inputSource: 'dom',
    clickTimeScale: settings.clickTimeScale,
    trailTimeScale: settings.trailTimeScale,
    webgpuHdrPeak: settings.webgpuHdrPeak,
    webgpuHdrBrightness: settings.webgpuHdrBrightness,
    webgpuHdrColorPreservation: settings.webgpuHdrColorPreservation,
    webgpuHdrWhiteCore: settings.webgpuHdrWhiteCore,
    webgpuHdrWhiteStart: settings.webgpuHdrWhiteStart,
    webgpuHdrWhiteEnd: settings.webgpuHdrWhiteEnd,
    outputCompositing: settings.outputCompositing,
    overlayAlphaPolicy: settings.overlayAlphaPolicy,
    overlayColorCompensation: settings.overlayColorCompensation,
    overlayAlphaLimit: settings.overlayAlphaLimit,
    hostCompositing: settings.hostCompositing,
    // 外层 fixed host 已接管最终 CSS 混合；核心只需向调用方宿主交付完整载荷。
    hostCompositingSurface: 'native',
    isolatedCompositing: settings.isolatedCompositing,
    lightBackgroundContrastAlpha: settings.lightBackgroundContrastAlpha,
    ...getRenderProfile(settings),
  };
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

function applyFxParams(settings)
{
  const result = engine.setFxParams(settings.fxParams,
  {
    reset: true,
    strict: true,
    schemaVersion: FX_PARAM_SCHEMA_VERSION,
  });

  if (!result.committed)
  {
    const reasons = result.rejected
      .map(({ path, reason }) => `${path}: ${reason}`)
      .join(', ');

    throw new Error(`特效参数应用失败：${reasons || 'unknown'}`);
  }
}

function updateBackendStatus()
{
  if (!engine)
  {
    backendStatus = null;
    return;
  }

  const snapshot = engine.getConfig();

  backendStatus = {
    requestedEffectBackend: snapshot.effectBackend,
    resolvedEffectBackend: snapshot.resolvedEffectBackend,
    resolvedWebGPUOutputMode: snapshot.resolvedWebGPUOutputMode,
    requestedBloomBackend: snapshot.bloomBackend,
    resolvedBloomBackend: snapshot.resolvedBloomBackend,
    requestedHostCompositing: snapshot.requestedHostCompositing,
    resolvedHostCompositing: snapshot.resolvedHostCompositing,
    hostCompositingSurface: snapshot.hostCompositingSurface,
    compositingWarning: snapshot.compositingWarning,
  };
}

function handleBackendChange()
{
  // 事件可能在后端回退或 Context 恢复期间重入，始终读取同一份核心快照。
  updateBackendStatus();
}

function handleHostCompositingChange()
{
  if (engine && surface)
  {
    // fixed 宿主是实际读取网页 backdrop 的边界，使用核心解析后的有效合同。
    applySurfaceCompositing(surface, engine);
    updateBackendStatus();
  }
}

function addEngineListeners()
{
  engine.canvas.addEventListener(EFFECT_BACKEND_CHANGE_EVENT, handleBackendChange);
  engine.canvas.addEventListener(BLOOM_BACKEND_CHANGE_EVENT, handleBackendChange);
  engine.canvas.addEventListener(
    HOST_COMPOSITING_CHANGE_EVENT,
    handleHostCompositingChange,
  );
  updateBackendStatus();
  handleHostCompositingChange();
}

function removeEngineListeners(instance)
{
  instance.canvas.removeEventListener(EFFECT_BACKEND_CHANGE_EVENT, handleBackendChange);
  instance.canvas.removeEventListener(BLOOM_BACKEND_CHANGE_EVENT, handleBackendChange);
  instance.canvas.removeEventListener(
    HOST_COMPOSITING_CHANGE_EVENT,
    handleHostCompositingChange,
  );
}

function getBackendStatus()
{
  if (backendStatus)
  {
    return backendStatus;
  }

  const profile = getRenderProfile(currentSettings);

  return {
    requestedEffectBackend: profile.effectBackend,
    resolvedEffectBackend: null,
    resolvedWebGPUOutputMode: null,
    requestedBloomBackend: profile.bloomBackend,
    resolvedBloomBackend: null,
    requestedHostCompositing: currentSettings.hostCompositing,
    resolvedHostCompositing: null,
    hostCompositingSurface: 'native',
    compositingWarning: null,
  };
}

function applySettings(settings)
{
  if (!engine)
  {
    return;
  }

  const fxParamsMustBeApplied = Boolean(
    !appliedSettings ||
    appliedSettings.renderMode !== settings.renderMode ||
    !hasSameFxParams(appliedSettings, settings),
  );

  const hostContractChanged = Boolean(
    appliedSettings &&
    (
      appliedSettings.outputCompositing !== settings.outputCompositing ||
      appliedSettings.hostCompositing !== settings.hostCompositing
    ),
  );

  if (hostContractChanged)
  {
    // 旧帧使用的是另一种宿主载荷，先清除再切换最外层混合，避免短暂误合成。
    engine.clear();
  }

  engine.updateConfig(getEngineOptions(settings));
  applySurfaceCompositing(surface, engine);

  if (fxParamsMustBeApplied)
  {
    applyFxParams(settings);
  }

  appliedSettings = settings;
  updateBackendStatus();
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
    // 构造时提交完整宿主配置，避免按核心默认后端分配再切换的瞬时开销。
    engine = new BAClickFX(
    {
      target: surface.container,
      ...getEngineOptions(currentSettings),
    });
    addEngineListeners();
    applyFxParams(currentSettings);
    appliedSettings = currentSettings;
    updateBackendStatus();
  }
  catch (error)
  {
    if (engine)
    {
      removeEngineListeners(engine);
      engine.destroy();
      engine = null;
    }

    appliedSettings = null;
    backendStatus = null;

    surface.host.remove();
    surface = null;
    throw error;
  }
}

function destroyEngine()
{
  if (engine)
  {
    removeEngineListeners(engine);
    engine.destroy();
    engine = null;
  }

  appliedSettings = null;
  backendStatus = null;

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
    const status = getBackendStatus();

    sendResponse(
    {
      protocolVersion: MESSAGE_PROTOCOL_VERSION,
      state: initializationState,
      error: initializationError,
      active: Boolean(engine),
      siteKey,
      ...status,
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

if (reducedMotionQuery)
{
  reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
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
