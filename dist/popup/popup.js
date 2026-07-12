(() => {
  // src/shared/settings.js
  var DEFAULT_SETTINGS = Object.freeze(
    {
      enabled: true,
      clickEnabled: true,
      trailEnabled: true,
      trailAlways: true,
      color: "#69a1ff",
      opacity: 0.5,
      scale: 1.1,
      quality: "balanced",
      disabledSites: Object.freeze({})
    }
  );
  var QUALITY_PROFILES = Object.freeze(
    {
      performance: Object.freeze(
        {
          maxDpr: 1,
          trailRenderScale: 0.6
        }
      ),
      balanced: Object.freeze(
        {
          maxDpr: 1,
          trailRenderScale: 0.8
        }
      ),
      high: Object.freeze(
        {
          maxDpr: 2,
          trailRenderScale: 1
        }
      )
    }
  );
  var HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
  var MAX_SITE_KEY_LENGTH = 512;
  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, number));
  }
  function normalizeDisabledSites(value) {
    const sites = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return sites;
    }
    for (const [key, disabled] of Object.entries(value)) {
      if (disabled === true && typeof key === "string" && key.length > 0 && key.length <= MAX_SITE_KEY_LENGTH) {
        sites[key] = true;
      }
    }
    return sites;
  }
  function normalizeSettings(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const color = typeof source.color === "string" && HEX_COLOR_PATTERN.test(source.color) ? source.color.toLowerCase() : DEFAULT_SETTINGS.color;
    const quality = Object.hasOwn(QUALITY_PROFILES, source.quality) ? source.quality : DEFAULT_SETTINGS.quality;
    return {
      enabled: source.enabled === void 0 ? DEFAULT_SETTINGS.enabled : source.enabled === true,
      clickEnabled: source.clickEnabled === void 0 ? DEFAULT_SETTINGS.clickEnabled : source.clickEnabled === true,
      trailEnabled: source.trailEnabled === void 0 ? DEFAULT_SETTINGS.trailEnabled : source.trailEnabled === true,
      trailAlways: source.trailAlways === void 0 ? DEFAULT_SETTINGS.trailAlways : source.trailAlways === true,
      color,
      opacity: clamp(source.opacity, 0.1, 1, DEFAULT_SETTINGS.opacity),
      scale: clamp(source.scale, 0.5, 2, DEFAULT_SETTINGS.scale),
      quality,
      disabledSites: normalizeDisabledSites(source.disabledSites)
    };
  }
  function getSiteKey(urlValue) {
    try {
      const url = new URL(urlValue);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
      if (url.protocol === "file:") {
        return "file://";
      }
    } catch {
      return null;
    }
    return null;
  }

  // _locales/en/messages.json
  var messages_default = {
    extensionName: {
      message: "BA Click FX",
      description: "Extension name"
    },
    extensionShortName: {
      message: "BA Click FX",
      description: "Short extension name"
    },
    extensionDescription: {
      message: "Add game-inspired click rings, particles, and cursor trails to ordinary websites.",
      description: "Manifest and store short description"
    },
    actionTitle: {
      message: "BA Click FX settings"
    },
    popupTagline: {
      message: "Game-inspired pointer effects"
    },
    globalEnable: {
      message: "Enable globally"
    },
    currentSite: {
      message: "Current website"
    },
    loading: {
      message: "Loading…"
    },
    siteEnable: {
      message: "Enable on the current website"
    },
    siteStorageNotice: {
      message: "Disabling a website stores only its origin in browser sync settings."
    },
    effectsTitle: {
      message: "Effects"
    },
    clickEffect: {
      message: "Click effect"
    },
    clickEffectDescription: {
      message: "Show rings and particles when clicking"
    },
    cursorTrail: {
      message: "Cursor trail"
    },
    cursorTrailDescription: {
      message: "Show a blue light trail while moving or dragging"
    },
    trailAlways: {
      message: "Always show while moving"
    },
    trailAlwaysDescription: {
      message: "When off, show the trail only while pressing the pointer"
    },
    appearanceTitle: {
      message: "Appearance & performance"
    },
    themeColor: {
      message: "Theme color"
    },
    opacity: {
      message: "Opacity"
    },
    effectSize: {
      message: "Effect size"
    },
    quality: {
      message: "Quality"
    },
    qualityDescription: {
      message: "High quality uses a higher device pixel ratio"
    },
    qualityPerformance: {
      message: "Power saving"
    },
    qualityBalanced: {
      message: "Balanced"
    },
    qualityHigh: {
      message: "High"
    },
    previewEffect: {
      message: "Preview click effect"
    },
    resetDefaults: {
      message: "Reset"
    },
    syncNotice: {
      message: "Settings sync through your browser account"
    },
    projectRepository: {
      message: "Project repository"
    },
    localFile: {
      message: "Local file"
    },
    pageUnavailable: {
      message: "Page unavailable"
    },
    statusSaved: {
      message: "Settings saved"
    },
    statusSaveFailed: {
      message: "Could not save settings: $ERROR$",
      placeholders: {
        error: {
          content: "$1"
        }
      }
    },
    statusPreviewUnsupported: {
      message: "Preview is unavailable on this page"
    },
    statusPreviewTriggered: {
      message: "Preview triggered in the center of the page"
    },
    statusEnableClick: {
      message: "Enable the click effect first"
    },
    statusRefreshForPreview: {
      message: "Refresh the current page, then try again"
    },
    statusReset: {
      message: "Default settings restored"
    },
    statusInternalPage: {
      message: "Browser internal pages do not allow effects"
    },
    statusPageNotLoaded: {
      message: "The extension is not loaded on this page; refresh an ordinary webpage"
    },
    statusInitFailed: {
      message: "Could not initialize: $ERROR$",
      placeholders: {
        error: {
          content: "$1"
        }
      }
    }
  };

  // _locales/zh_CN/messages.json
  var messages_default2 = {
    extensionName: {
      message: "BA Click FX",
      description: "插件名称"
    },
    extensionShortName: {
      message: "BA Click FX",
      description: "插件短名称"
    },
    extensionDescription: {
      message: "为普通网页添加游戏风格的点击圆环、粒子碎片和鼠标光标拖尾。",
      description: "Manifest 与商店短描述"
    },
    actionTitle: {
      message: "BA Click FX 设置"
    },
    popupTagline: {
      message: "游戏风格鼠标特效"
    },
    globalEnable: {
      message: "全局启用"
    },
    currentSite: {
      message: "当前网站"
    },
    loading: {
      message: "正在读取…"
    },
    siteEnable: {
      message: "在当前网站启用"
    },
    siteStorageNotice: {
      message: "关闭当前网站时，仅会把该网站的 origin 保存到浏览器同步设置。"
    },
    effectsTitle: {
      message: "效果"
    },
    clickEffect: {
      message: "点击特效"
    },
    clickEffectDescription: {
      message: "点击时显示圆环与碎片"
    },
    cursorTrail: {
      message: "光标拖尾"
    },
    cursorTrailDescription: {
      message: "移动或拖动时显示蓝色光轨"
    },
    trailAlways: {
      message: "移动时始终显示"
    },
    trailAlwaysDescription: {
      message: "关闭后仅按住鼠标时显示拖尾"
    },
    appearanceTitle: {
      message: "外观与性能"
    },
    themeColor: {
      message: "主题颜色"
    },
    opacity: {
      message: "不透明度"
    },
    effectSize: {
      message: "特效大小"
    },
    quality: {
      message: "画质"
    },
    qualityDescription: {
      message: "高画质会使用更高设备像素比"
    },
    qualityPerformance: {
      message: "省电"
    },
    qualityBalanced: {
      message: "均衡"
    },
    qualityHigh: {
      message: "高画质"
    },
    previewEffect: {
      message: "预览点击特效"
    },
    resetDefaults: {
      message: "恢复默认"
    },
    syncNotice: {
      message: "设置会自动同步到同一浏览器账号"
    },
    projectRepository: {
      message: "项目仓库"
    },
    localFile: {
      message: "本地文件"
    },
    pageUnavailable: {
      message: "此页面不可用"
    },
    statusSaved: {
      message: "设置已保存"
    },
    statusSaveFailed: {
      message: "保存失败：$ERROR$",
      placeholders: {
        error: {
          content: "$1"
        }
      }
    },
    statusPreviewUnsupported: {
      message: "当前页面不支持预览"
    },
    statusPreviewTriggered: {
      message: "已在页面中央触发预览"
    },
    statusEnableClick: {
      message: "请先启用点击特效"
    },
    statusRefreshForPreview: {
      message: "请刷新当前网页后再预览"
    },
    statusReset: {
      message: "已恢复默认设置"
    },
    statusInternalPage: {
      message: "浏览器内部页面不支持注入特效"
    },
    statusPageNotLoaded: {
      message: "此页面尚未加载插件；普通网页请刷新后重试"
    },
    statusInitFailed: {
      message: "初始化失败：$ERROR$",
      placeholders: {
        error: {
          content: "$1"
        }
      }
    }
  };

  // src/popup/locale.js
  var DEFAULT_LOCALE = "zh_CN";
  var ENGLISH_LOCALE = "en";
  function readBrowserLanguage(chromeApi, navigatorApi) {
    try {
      const uiLanguage = chromeApi?.i18n?.getUILanguage?.();
      if (typeof uiLanguage === "string" && uiLanguage.trim()) {
        return uiLanguage;
      }
    } catch {
    }
    try {
      const languages = Array.isArray(navigatorApi?.languages) ? navigatorApi.languages : [];
      const language = languages.find((item) => typeof item === "string" && item.trim()) || navigatorApi?.language;
      if (typeof language === "string" && language.trim()) {
        return language;
      }
    } catch {
    }
    return "";
  }
  function selectLocale(language) {
    if (typeof language !== "string" || !language.trim()) {
      return DEFAULT_LOCALE;
    }
    return /^zh(?:[-_]|$)/i.test(language.trim()) ? DEFAULT_LOCALE : ENGLISH_LOCALE;
  }
  function detectLocale(chromeApi = globalThis.chrome, navigatorApi = globalThis.navigator) {
    return selectLocale(readBrowserLanguage(chromeApi, navigatorApi));
  }

  // src/popup/popup.js
  var MESSAGE_PREVIEW = "BA_CLICK_FX_PREVIEW";
  var MESSAGE_GET_STATUS = "BA_CLICK_FX_GET_STATUS";
  var activeLocale = detectLocale();
  var MESSAGE_CATALOGS = {
    en: messages_default,
    zh_CN: messages_default2
  };
  var activeMessages = MESSAGE_CATALOGS[activeLocale] || MESSAGE_CATALOGS[DEFAULT_LOCALE];
  var FALLBACK_MESSAGES = {
    localFile: "本地文件",
    pageUnavailable: "此页面不可用",
    statusSaved: "设置已保存",
    statusSaveFailed: "保存失败：$1",
    statusPreviewUnsupported: "当前页面不支持预览",
    statusPreviewTriggered: "已在页面中央触发预览",
    statusEnableClick: "请先启用点击特效",
    statusRefreshForPreview: "请刷新当前网页后再预览",
    statusReset: "已恢复默认设置",
    statusInternalPage: "浏览器内部页面不支持注入特效",
    statusPageNotLoaded: "此页面尚未加载插件；普通网页请刷新后重试",
    statusInitFailed: "初始化失败：$1"
  };
  var elements = {
    enabled: document.querySelector("#enabled"),
    siteEnabled: document.querySelector("#site-enabled"),
    siteName: document.querySelector("#site-name"),
    clickEnabled: document.querySelector("#click-enabled"),
    trailEnabled: document.querySelector("#trail-enabled"),
    trailAlways: document.querySelector("#trail-always"),
    color: document.querySelector("#color"),
    colorValue: document.querySelector("#color-value"),
    opacity: document.querySelector("#opacity"),
    opacityValue: document.querySelector("#opacity-value"),
    scale: document.querySelector("#scale"),
    scaleValue: document.querySelector("#scale-value"),
    quality: document.querySelector("#quality"),
    preview: document.querySelector("#preview"),
    reset: document.querySelector("#reset"),
    status: document.querySelector("#status")
  };
  var settings = normalizeSettings(DEFAULT_SETTINGS);
  var activeTab = null;
  var activeSiteKey = null;
  var contentAvailable = false;
  var statusTimer = 0;
  var updateRevision = 0;
  var writeQueue = Promise.resolve();
  function getMessage(key, substitutions = []) {
    const values = Array.isArray(substitutions) ? substitutions : [substitutions];
    const definition = activeMessages[key];
    if (definition?.message) {
      let localized = definition.message;
      for (const [name, placeholder] of Object.entries(definition.placeholders || {})) {
        const index = Number(placeholder.content.slice(1)) - 1;
        localized = localized.replaceAll(
          `$${name.toUpperCase()}$`,
          String(values[index] ?? "")
        );
      }
      return localized;
    }
    let fallback = FALLBACK_MESSAGES[key] || key;
    values.forEach((value, index) => {
      fallback = fallback.replaceAll(`$${index + 1}`, String(value));
    });
    return fallback;
  }
  function localizeDocument() {
    document.documentElement.lang = activeLocale === DEFAULT_LOCALE ? "zh-CN" : "en";
    for (const element of document.querySelectorAll("[data-i18n]")) {
      const localized = getMessage(element.dataset.i18n);
      if (localized !== element.dataset.i18n) {
        element.textContent = localized;
      }
    }
    for (const element of document.querySelectorAll("[data-i18n-title]")) {
      const localized = getMessage(element.dataset.i18nTitle);
      if (localized !== element.dataset.i18nTitle) {
        element.title = localized;
      }
    }
    document.title = getMessage("extensionName");
  }
  function readSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(normalizeSettings(stored));
      });
    });
  }
  function writeSettings(patch) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(patch, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    });
  }
  function queryActiveTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(tabs[0] || null);
      });
    });
  }
  function sendTabMessage(tabId, type) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { type }, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(response);
      });
    });
  }
  function showStatus(messageKey, tone = "normal", substitutions = []) {
    window.clearTimeout(statusTimer);
    elements.status.textContent = messageKey ? getMessage(messageKey, substitutions) : "";
    elements.status.dataset.tone = tone;
    if (messageKey) {
      statusTimer = window.setTimeout(() => {
        elements.status.textContent = "";
        delete elements.status.dataset.tone;
      }, 2600);
    }
  }
  function getSiteLabel(tab) {
    if (!tab?.url) {
      return getMessage("pageUnavailable");
    }
    try {
      const url = new URL(tab.url);
      if (url.protocol === "file:") {
        return getMessage("localFile");
      }
      return url.hostname || getMessage("pageUnavailable");
    } catch {
      return getMessage("pageUnavailable");
    }
  }
  function render() {
    elements.enabled.checked = settings.enabled;
    elements.clickEnabled.checked = settings.clickEnabled;
    elements.trailEnabled.checked = settings.trailEnabled;
    elements.trailAlways.checked = settings.trailAlways;
    elements.trailAlways.disabled = !settings.trailEnabled;
    elements.color.value = settings.color;
    elements.colorValue.textContent = settings.color;
    elements.opacity.value = String(settings.opacity);
    elements.opacityValue.textContent = `${Math.round(settings.opacity * 100)}%`;
    elements.scale.value = String(settings.scale);
    elements.scaleValue.textContent = `${settings.scale.toFixed(2)}×`;
    elements.quality.value = settings.quality;
    const siteSupported = Boolean(activeSiteKey && contentAvailable);
    const siteEnabled = siteSupported && settings.disabledSites[activeSiteKey] !== true;
    elements.siteName.textContent = getSiteLabel(activeTab);
    elements.siteEnabled.checked = siteEnabled;
    elements.siteEnabled.disabled = !siteSupported;
    elements.preview.disabled = !(activeTab?.id && contentAvailable && settings.enabled && siteEnabled && settings.clickEnabled);
  }
  async function updateSettings(patch, successMessageKey = "statusSaved") {
    const revision = ++updateRevision;
    settings = normalizeSettings({ ...settings, ...patch });
    const snapshot = settings;
    render();
    const writeOperation = writeQueue.catch(() => {
    }).then(() => writeSettings(snapshot));
    writeQueue = writeOperation;
    try {
      await writeOperation;
      if (revision === updateRevision) {
        showStatus(successMessageKey, "success");
      }
    } catch (error) {
      if (revision === updateRevision) {
        try {
          const stored = await readSettings();
          if (revision === updateRevision) {
            settings = stored;
            render();
          }
        } catch {
        }
        if (revision === updateRevision) {
          showStatus("statusSaveFailed", "error", [error.message]);
        }
      }
    }
  }
  function bindToggle(element, key) {
    element.addEventListener("change", () => {
      void updateSettings({ [key]: element.checked });
    });
  }
  function bindEvents() {
    bindToggle(elements.enabled, "enabled");
    bindToggle(elements.clickEnabled, "clickEnabled");
    bindToggle(elements.trailEnabled, "trailEnabled");
    bindToggle(elements.trailAlways, "trailAlways");
    elements.siteEnabled.addEventListener("change", () => {
      if (!activeSiteKey || !contentAvailable) {
        return;
      }
      const disabledSites = { ...settings.disabledSites };
      if (elements.siteEnabled.checked) {
        delete disabledSites[activeSiteKey];
      } else {
        disabledSites[activeSiteKey] = true;
      }
      void updateSettings({ disabledSites });
    });
    elements.color.addEventListener("input", () => {
      elements.colorValue.textContent = elements.color.value;
    });
    elements.color.addEventListener("change", () => {
      void updateSettings({ color: elements.color.value });
    });
    elements.opacity.addEventListener("input", () => {
      elements.opacityValue.textContent = `${Math.round(Number(elements.opacity.value) * 100)}%`;
    });
    elements.opacity.addEventListener("change", () => {
      void updateSettings({ opacity: Number(elements.opacity.value) });
    });
    elements.scale.addEventListener("input", () => {
      elements.scaleValue.textContent = `${Number(elements.scale.value).toFixed(2)}×`;
    });
    elements.scale.addEventListener("change", () => {
      void updateSettings({ scale: Number(elements.scale.value) });
    });
    elements.quality.addEventListener("change", () => {
      void updateSettings({ quality: elements.quality.value });
    });
    elements.preview.addEventListener("click", async () => {
      if (!activeTab?.id) {
        showStatus("statusPreviewUnsupported", "error");
        return;
      }
      try {
        const response = await sendTabMessage(activeTab.id, MESSAGE_PREVIEW);
        if (response?.ok) {
          showStatus("statusPreviewTriggered", "success");
        } else {
          showStatus("statusEnableClick", "error");
        }
      } catch {
        showStatus("statusRefreshForPreview", "error");
      }
    });
    elements.reset.addEventListener("click", () => {
      void updateSettings({ ...DEFAULT_SETTINGS }, "statusReset");
    });
  }
  async function initialize() {
    localizeDocument();
    bindEvents();
    try {
      [settings, activeTab] = await Promise.all([
        readSettings(),
        queryActiveTab()
      ]);
      activeSiteKey = getSiteKey(activeTab?.url);
      if (activeSiteKey && activeTab?.id) {
        try {
          const contentStatus = await sendTabMessage(activeTab.id, MESSAGE_GET_STATUS);
          contentAvailable = contentStatus?.siteKey === activeSiteKey;
        } catch {
          contentAvailable = false;
        }
      }
      render();
      if (!activeSiteKey) {
        showStatus("statusInternalPage");
      } else if (!contentAvailable) {
        showStatus("statusPageNotLoaded");
      }
    } catch (error) {
      render();
      showStatus("statusInitFailed", "error", [error.message]);
    }
  }
  void initialize();
})();
