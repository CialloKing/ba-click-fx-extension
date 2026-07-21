import { createI18n } from '../shared/i18n.js';
import {
  DEFAULT_SETTINGS,
  getQualitySettingsPatch,
  getSiteKey,
  normalizeSettings,
} from '../shared/settings.js';
import {
  applyStorageChanges,
  readSettings,
  writeSettingsPatch,
} from '../shared/storage.js';

const MESSAGE_PREVIEW = 'BA_CLICK_FX_PREVIEW';
const MESSAGE_GET_STATUS = 'BA_CLICK_FX_GET_STATUS';
const MESSAGE_PROTOCOL_VERSION = 2;

const elements =
{
  enabled: document.querySelector('#enabled'),
  siteEnabled: document.querySelector('#site-enabled'),
  siteName: document.querySelector('#site-name'),
  clickEnabled: document.querySelector('#click-enabled'),
  trailEnabled: document.querySelector('#trail-enabled'),
  trailAlways: document.querySelector('#trail-always'),
  quality: document.querySelector('#quality'),
  languageMode: document.querySelector('#language-mode'),
  preview: document.querySelector('#preview'),
  openOptions: document.querySelector('#open-options'),
  status: document.querySelector('#status'),
};

let i18n = createI18n(DEFAULT_SETTINGS.languageMode);
let settings = DEFAULT_SETTINGS;
let activeTab = null;
let activeSiteKey = null;
let contentStatus = null;
let statusTimer = 0;
let updateRevision = 0;
let writeQueue = Promise.resolve();

function queryActiveTab()
{
  return new Promise((resolve, reject) =>
  {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
    {
      const error = chrome.runtime.lastError;

      if (error)
      {
        reject(new Error(error.message));
        return;
      }

      resolve(tabs[0] || null);
    });
  });
}

function sendTabMessage(tabId, type)
{
  return new Promise((resolve, reject) =>
  {
    chrome.tabs.sendMessage(tabId, { type }, (response) =>
    {
      const error = chrome.runtime.lastError;

      if (error)
      {
        reject(new Error(error.message));
        return;
      }

      resolve(response);
    });
  });
}

function showStatus(messageKey, tone = 'normal', substitutions = [])
{
  window.clearTimeout(statusTimer);
  elements.status.textContent = messageKey ? i18n.getMessage(messageKey, substitutions) : '';
  elements.status.dataset.tone = tone;

  if (messageKey)
  {
    statusTimer = window.setTimeout(() =>
    {
      elements.status.textContent = '';
      delete elements.status.dataset.tone;
    }, 3200);
  }
}

function getSiteLabel(tab)
{
  if (!tab?.url)
  {
    return i18n.getMessage('pageUnavailable');
  }

  try
  {
    const url = new URL(tab.url);

    if (url.protocol === 'file:')
    {
      return i18n.getMessage('localFile');
    }

    return url.hostname || i18n.getMessage('pageUnavailable');
  }
  catch
  {
    return i18n.getMessage('pageUnavailable');
  }
}

function isContentReady()
{
  return Boolean(
    contentStatus?.protocolVersion === MESSAGE_PROTOCOL_VERSION &&
    contentStatus?.siteKey === activeSiteKey &&
    contentStatus?.state === 'ready',
  );
}

function render()
{
  elements.enabled.checked = settings.enabled;
  elements.clickEnabled.checked = settings.clickEnabled;
  elements.trailEnabled.checked = settings.trailEnabled;
  elements.trailAlways.checked = settings.trailAlways;
  elements.trailAlways.disabled = !settings.trailEnabled;
  elements.quality.value = settings.quality;
  elements.languageMode.value = settings.languageMode;

  const siteSupported = Boolean(activeSiteKey);
  const siteEnabled = siteSupported && settings.disabledSites[activeSiteKey] !== true;

  elements.siteName.textContent = getSiteLabel(activeTab);
  elements.siteEnabled.checked = siteEnabled;
  elements.siteEnabled.disabled = !siteSupported;
  elements.preview.disabled = !(
    activeTab?.id &&
    isContentReady() &&
    settings.enabled &&
    siteEnabled &&
    settings.clickEnabled
  );
}

async function updateSettings(patch, successMessageKey = 'statusSaved')
{
  const revision = ++updateRevision;
  const previousSettings = settings;

  settings = normalizeSettings({ ...settings, ...patch });
  const normalizedPatch = {};

  for (const key of Object.keys(patch))
  {
    normalizedPatch[key] = settings[key];
  }

  render();

  const writeOperation = writeQueue
    .catch(() =>
    {
      // 前一次失败不应阻止后续独立设置继续保存。
    })
    .then(() => writeSettingsPatch(normalizedPatch));

  writeQueue = writeOperation;

  try
  {
    await writeOperation;

    if (revision === updateRevision)
    {
      showStatus(successMessageKey, 'success');
    }
  }
  catch (error)
  {
    if (revision === updateRevision)
    {
      settings = previousSettings;
      render();
      showStatus('statusSaveFailed', 'error', [error.message]);
    }
  }
}

function bindToggle(element, key)
{
  element.addEventListener('change', () =>
  {
    void updateSettings({ [key]: element.checked });
  });
}

function bindEvents()
{
  bindToggle(elements.enabled, 'enabled');
  bindToggle(elements.clickEnabled, 'clickEnabled');
  bindToggle(elements.trailEnabled, 'trailEnabled');
  bindToggle(elements.trailAlways, 'trailAlways');

  elements.quality.addEventListener('change', () =>
  {
    void updateSettings(
    {
      ...getQualitySettingsPatch(elements.quality.value),
      preset: 'custom',
    });
  });

  elements.languageMode.addEventListener('change', async () =>
  {
    await updateSettings({ languageMode: elements.languageMode.value });
    i18n = createI18n(settings.languageMode);
    i18n.localizeDocument();
    render();
  });

  elements.siteEnabled.addEventListener('change', () =>
  {
    if (!activeSiteKey)
    {
      return;
    }

    const disabledSites = { ...settings.disabledSites };

    if (elements.siteEnabled.checked)
    {
      delete disabledSites[activeSiteKey];
    }
    else
    {
      disabledSites[activeSiteKey] = true;
    }

    void updateSettings({ disabledSites });
  });

  elements.preview.addEventListener('click', async () =>
  {
    if (!activeTab?.id || !isContentReady())
    {
      showStatus('statusPreviewUnsupported', 'error');
      return;
    }

    try
    {
      const response = await sendTabMessage(activeTab.id, MESSAGE_PREVIEW);

      if (response?.ok)
      {
        showStatus('statusPreviewTriggered', 'success');
      }
      else
      {
        showStatus('statusEnableClick', 'error');
      }
    }
    catch
    {
      showStatus('statusRefreshForPreview', 'error');
    }
  });

  elements.openOptions.addEventListener('click', () =>
  {
    chrome.runtime.openOptionsPage();
  });
}

function bindStorageChanges()
{
  chrome.storage.onChanged.addListener((changes, areaName) =>
  {
    if (areaName !== 'sync' && areaName !== 'local')
    {
      return;
    }

    const previousLanguageMode = settings.languageMode;
    const nextSettings = applyStorageChanges(settings, changes, areaName);

    if (nextSettings !== settings)
    {
      settings = nextSettings;

      if (settings.languageMode !== previousLanguageMode)
      {
        i18n = createI18n(settings.languageMode);
        i18n.localizeDocument();
      }

      render();
    }
  });
}

async function initialize()
{
  bindEvents();
  bindStorageChanges();

  try
  {
    [settings, activeTab] = await Promise.all([
      readSettings(),
      queryActiveTab(),
    ]);
    i18n = createI18n(settings.languageMode);
    i18n.localizeDocument();
    activeSiteKey = getSiteKey(activeTab?.url);

    if (activeSiteKey && activeTab?.id)
    {
      try
      {
        contentStatus = await sendTabMessage(activeTab.id, MESSAGE_GET_STATUS);
      }
      catch
      {
        contentStatus = null;
      }
    }

    render();

    if (!activeSiteKey)
    {
      showStatus('statusInternalPage');
    }
    else if (!contentStatus)
    {
      showStatus('statusPageNotLoaded');
    }
    else if (contentStatus.protocolVersion !== MESSAGE_PROTOCOL_VERSION)
    {
      showStatus('statusRefreshForUpdate');
    }
    else if (contentStatus.state === 'error')
    {
      showStatus('statusContentInitFailed', 'error');
    }
    else if (contentStatus.state !== 'ready')
    {
      showStatus('statusContentLoading');
    }
  }
  catch (error)
  {
    i18n.localizeDocument();
    render();
    showStatus('statusInitFailed', 'error', [error.message]);
  }
}

void initialize();
