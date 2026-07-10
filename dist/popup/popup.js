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

  // src/popup/popup.js
  var MESSAGE_PREVIEW = "BA_CLICK_FX_PREVIEW";
  var MESSAGE_GET_STATUS = "BA_CLICK_FX_GET_STATUS";
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
  function showStatus(message, tone = "normal") {
    window.clearTimeout(statusTimer);
    elements.status.textContent = message;
    elements.status.dataset.tone = tone;
    if (message) {
      statusTimer = window.setTimeout(() => {
        elements.status.textContent = "";
        delete elements.status.dataset.tone;
      }, 2600);
    }
  }
  function getSiteLabel(tab) {
    if (!tab?.url) {
      return "此页面不可用";
    }
    try {
      const url = new URL(tab.url);
      if (url.protocol === "file:") {
        return "本地文件";
      }
      return url.hostname || "此页面不可用";
    } catch {
      return "此页面不可用";
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
  async function updateSettings(patch, successMessage = "设置已保存") {
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
        showStatus(successMessage, "success");
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
          showStatus(`保存失败：${error.message}`, "error");
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
        showStatus("当前页面不支持预览", "error");
        return;
      }
      try {
        const response = await sendTabMessage(activeTab.id, MESSAGE_PREVIEW);
        if (response?.ok) {
          showStatus("已在页面中央触发预览", "success");
        } else {
          showStatus("请先启用点击特效", "error");
        }
      } catch {
        showStatus("请刷新当前网页后再预览", "error");
      }
    });
    elements.reset.addEventListener("click", () => {
      void updateSettings({ ...DEFAULT_SETTINGS }, "已恢复默认设置");
    });
  }
  async function initialize() {
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
        showStatus("浏览器内部页面不支持注入特效");
      } else if (!contentAvailable) {
        showStatus("此页面尚未加载插件；普通网页请刷新后重试");
      }
    } catch (error) {
      render();
      showStatus(`初始化失败：${error.message}`, "error");
    }
  }
  void initialize();
})();
