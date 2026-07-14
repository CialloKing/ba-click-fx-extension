import { createI18n } from '../shared/i18n.js';
import {
  APPEARANCE_PRESETS,
  DEFAULT_SETTINGS,
  normalizeSettings,
} from '../shared/settings.js';
import {
  applyStorageChanges,
  loadStorageState,
  removeLegacyDisabledSites,
  writeSettingsPatch,
} from '../shared/storage.js';

const VISUAL_DEFAULTS =
{
  enabled: DEFAULT_SETTINGS.enabled,
  clickEnabled: DEFAULT_SETTINGS.clickEnabled,
  trailEnabled: DEFAULT_SETTINGS.trailEnabled,
  trailAlways: DEFAULT_SETTINGS.trailAlways,
  color: DEFAULT_SETTINGS.color,
  opacity: DEFAULT_SETTINGS.opacity,
  scale: DEFAULT_SETTINGS.scale,
  quality: DEFAULT_SETTINGS.quality,
  preset: DEFAULT_SETTINGS.preset,
};

const elements =
{
  preset: document.querySelector('#preset'),
  color: document.querySelector('#color'),
  colorValue: document.querySelector('#color-value'),
  opacity: document.querySelector('#opacity'),
  opacityValue: document.querySelector('#opacity-value'),
  scale: document.querySelector('#scale'),
  scaleValue: document.querySelector('#scale-value'),
  quality: document.querySelector('#quality'),
  languageMode: document.querySelector('#language-mode'),
  motionMode: document.querySelector('#motion-mode'),
  resetVisual: document.querySelector('#reset-visual'),
  siteCount: document.querySelector('#site-count'),
  siteSearch: document.querySelector('#site-search'),
  siteList: document.querySelector('#site-list'),
  emptySites: document.querySelector('#empty-sites'),
  clearSites: document.querySelector('#clear-sites'),
  legacyCard: document.querySelector('#legacy-card'),
  removeLegacy: document.querySelector('#remove-legacy'),
  version: document.querySelector('#version'),
  status: document.querySelector('#status'),
};

let settings = DEFAULT_SETTINGS;
let hasLegacyDisabledSites = false;
let i18n = createI18n(settings.languageMode);
let statusTimer = 0;

function showStatus(messageKey, tone = 'normal', substitutions = [])
{
  window.clearTimeout(statusTimer);
  elements.status.textContent = i18n.getMessage(messageKey, substitutions);
  elements.status.dataset.tone = tone;
  statusTimer = window.setTimeout(() =>
  {
    elements.status.textContent = '';
    delete elements.status.dataset.tone;
  }, 3200);
}

function localize()
{
  i18n = createI18n(settings.languageMode);
  i18n.localizeDocument();
  elements.siteSearch.placeholder = i18n.getMessage('searchSitesPlaceholder');
}

function renderSites()
{
  const query = elements.siteSearch.value.trim().toLowerCase();
  const sites = Object.keys(settings.disabledSites).sort();
  const visibleSites = query
    ? sites.filter((site) => site.toLowerCase().includes(query))
    : sites;
  const fragment = document.createDocumentFragment();

  for (const site of visibleSites)
  {
    const item = document.createElement('li');
    const label = document.createElement('span');
    const button = document.createElement('button');

    label.textContent = site;
    label.title = site;
    button.type = 'button';
    button.dataset.site = site;
    button.textContent = i18n.getMessage('removeSiteRule');
    button.setAttribute('aria-label', `${i18n.getMessage('removeSiteRule')}: ${site}`);
    item.append(label, button);
    fragment.appendChild(item);
  }

  elements.siteList.replaceChildren(fragment);
  elements.siteCount.textContent = String(sites.length);
  elements.emptySites.hidden = visibleSites.length > 0;
  elements.clearSites.disabled = sites.length === 0;
  elements.legacyCard.hidden = !hasLegacyDisabledSites;
}

function render()
{
  elements.preset.value = settings.preset;
  elements.color.value = settings.color;
  elements.colorValue.textContent = settings.color;
  elements.opacity.value = String(settings.opacity);
  elements.opacityValue.textContent = `${Math.round(settings.opacity * 100)}%`;
  elements.scale.value = String(settings.scale);
  elements.scaleValue.textContent = `${settings.scale.toFixed(2)}×`;
  elements.quality.value = settings.quality;
  elements.languageMode.value = settings.languageMode;
  elements.motionMode.value = settings.motionMode;
  elements.version.textContent = chrome.runtime.getManifest().version;
  renderSites();
}

async function savePatch(patch, successMessageKey = 'statusSaved')
{
  const previous = settings;

  settings = normalizeSettings({ ...settings, ...patch });
  render();

  try
  {
    await writeSettingsPatch(patch);
    showStatus(successMessageKey, 'success');
  }
  catch (error)
  {
    settings = previous;
    render();
    showStatus('statusSaveFailed', 'error', [error.message]);
  }
}

function saveCustomAppearance(patch)
{
  void savePatch({ ...patch, preset: 'custom' });
}

function bindEvents()
{
  elements.preset.addEventListener('change', () =>
  {
    const preset = APPEARANCE_PRESETS[elements.preset.value];

    if (!preset)
    {
      return;
    }

    void savePatch({ ...preset, preset: elements.preset.value }, 'statusPresetApplied');
  });

  elements.color.addEventListener('input', () =>
  {
    elements.colorValue.textContent = elements.color.value;
  });
  elements.color.addEventListener('change', () =>
  {
    saveCustomAppearance({ color: elements.color.value });
  });

  elements.opacity.addEventListener('input', () =>
  {
    elements.opacityValue.textContent = `${Math.round(Number(elements.opacity.value) * 100)}%`;
  });
  elements.opacity.addEventListener('change', () =>
  {
    saveCustomAppearance({ opacity: Number(elements.opacity.value) });
  });

  elements.scale.addEventListener('input', () =>
  {
    elements.scaleValue.textContent = `${Number(elements.scale.value).toFixed(2)}×`;
  });
  elements.scale.addEventListener('change', () =>
  {
    saveCustomAppearance({ scale: Number(elements.scale.value) });
  });

  elements.quality.addEventListener('change', () =>
  {
    saveCustomAppearance({ quality: elements.quality.value });
  });

  elements.languageMode.addEventListener('change', async () =>
  {
    await savePatch({ languageMode: elements.languageMode.value });
    localize();
    render();
  });

  elements.motionMode.addEventListener('change', () =>
  {
    void savePatch({ motionMode: elements.motionMode.value });
  });

  elements.resetVisual.addEventListener('click', () =>
  {
    void savePatch(VISUAL_DEFAULTS, 'statusVisualReset');
  });

  elements.siteSearch.addEventListener('input', renderSites);

  elements.siteList.addEventListener('click', (event) =>
  {
    const button = event.target.closest('button[data-site]');

    if (!button)
    {
      return;
    }

    const disabledSites = { ...settings.disabledSites };

    delete disabledSites[button.dataset.site];
    void savePatch({ disabledSites }, 'statusSiteRuleRemoved');
  });

  elements.clearSites.addEventListener('click', () =>
  {
    if (!window.confirm(i18n.getMessage('confirmClearSiteRules')))
    {
      return;
    }

    void savePatch({ disabledSites: {} }, 'statusSiteRulesCleared');
  });

  elements.removeLegacy.addEventListener('click', async () =>
  {
    if (!window.confirm(i18n.getMessage('confirmRemoveLegacyRules')))
    {
      return;
    }

    try
    {
      await removeLegacyDisabledSites();
      hasLegacyDisabledSites = false;
      renderSites();
      showStatus('statusLegacyRulesRemoved', 'success');
    }
    catch (error)
    {
      showStatus('statusSaveFailed', 'error', [error.message]);
    }
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

    if (nextSettings === settings)
    {
      return;
    }

    settings = nextSettings;

    if (settings.languageMode !== previousLanguageMode)
    {
      localize();
    }

    render();
  });
}

async function initialize()
{
  bindEvents();
  bindStorageChanges();

  try
  {
    const state = await loadStorageState();

    settings = state.settings;
    hasLegacyDisabledSites = state.hasLegacyDisabledSites;
    localize();
    render();
  }
  catch (error)
  {
    localize();
    render();
    showStatus('statusInitFailed', 'error', [error.message]);
  }
}

void initialize();
