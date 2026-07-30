import { createI18n } from '../shared/i18n.js';
import {
  FX_CONTROL_DEFINITIONS,
  FX_CONTROL_GROUPS,
  flattenFxParams,
  getFxParamDefault,
} from '../shared/fx-settings.js';
import {
  APPEARANCE_PRESETS,
  DEFAULT_SETTINGS,
  detectAppearancePreset,
  detectQualityProfile,
  getQualitySettingsPatch,
  normalizeSettings,
} from '../shared/settings.js';
import {
  applyStorageChanges,
  createSettingsWriteQueue,
  loadStorageState,
  removeLegacyDisabledSites,
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
  renderMode: DEFAULT_SETTINGS.renderMode,
  maxDpr: DEFAULT_SETTINGS.maxDpr,
  fxParams: DEFAULT_SETTINGS.fxParams,
  clickTimeScale: DEFAULT_SETTINGS.clickTimeScale,
  trailTimeScale: DEFAULT_SETTINGS.trailTimeScale,
  outputCompositing: DEFAULT_SETTINGS.outputCompositing,
  isolatedCompositing: DEFAULT_SETTINGS.isolatedCompositing,
  lightBackgroundContrastAlpha: DEFAULT_SETTINGS.lightBackgroundContrastAlpha,
  preset: DEFAULT_SETTINGS.preset,
};

const CLICK_GROUP_NAMES = new Set([
  'hit',
  'flare',
  'disk',
  'rings',
]);

const UNIT_MESSAGE_KEYS = Object.freeze(
{
  count: 'unitCount',
  'gamma-hdr': 'unitGammaHdr',
  'linear-hdr': 'unitLinearHdr',
  ms: 'unitMilliseconds',
  multiplier: 'unitMultiplier',
  px: 'unitPixels',
  'px-per-second': 'unitPixelsPerSecond',
  ratio: 'unitRatio',
  samples: 'unitSamples',
  scalar: 'unitScalar',
});

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
  renderMode: document.querySelector('#render-mode'),
  maxDpr: document.querySelector('#max-dpr'),
  maxDprValue: document.querySelector('#max-dpr-value'),
  outputCompositing: document.querySelector('#output-compositing'),
  isolatedCompositing: document.querySelector('#isolated-compositing'),
  lightBackgroundContrastAlpha: document.querySelector('#light-background-contrast-alpha'),
  lightBackgroundContrastAlphaValue: document.querySelector('#light-background-contrast-alpha-value'),
  clickEnabled: document.querySelector('#click-enabled'),
  clickTimeScale: document.querySelector('#click-time-scale'),
  clickTimeScaleValue: document.querySelector('#click-time-scale-value'),
  trailEnabled: document.querySelector('#trail-enabled'),
  trailAlways: document.querySelector('#trail-always'),
  trailTimeScale: document.querySelector('#trail-time-scale'),
  trailTimeScaleValue: document.querySelector('#trail-time-scale-value'),
  clickFxGroups: document.querySelector('#click-fx-groups'),
  trailFxGroups: document.querySelector('#trail-fx-groups'),
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
let updateRevision = 0;
const fxControls = new Map();
const queueSettingsWrite = createSettingsWriteQueue();

function countDecimalPlaces(value)
{
  const text = String(value).toLowerCase();

  if (text.includes('e-'))
  {
    return Number(text.split('e-')[1]) || 0;
  }

  return text.includes('.') ? text.split('.')[1].length : 0;
}

function getDirectionMessageKey(path, value)
{
  if (path === 'rings.rotationDirection')
  {
    return Number(value) < 0
      ? 'rotationCounterclockwise'
      : 'rotationClockwise';
  }

  return Number(value) < 0 ? 'directionNegative' : 'directionPositive';
}

function formatFxValue(definition, value)
{
  if (definition.type === 'boolean')
  {
    return value ? i18n.getMessage('enabledLabel') : i18n.getMessage('disabledLabel');
  }

  if (definition.unit === 'direction')
  {
    return i18n.getMessage(getDirectionMessageKey(definition.path, value));
  }

  const decimalPlaces = Math.min(4, countDecimalPlaces(definition.step));
  const formatted = Number(value).toFixed(decimalPlaces);
  const unitKey = UNIT_MESSAGE_KEYS[definition.unit] || definition.unitKey;

  return unitKey
    ? `${formatted} ${i18n.getMessage(unitKey)}`
    : formatted;
}

function createFxControl(definition)
{
  const label = document.createElement('label');
  const heading = document.createElement('span');
  const title = document.createElement('span');
  const output = document.createElement('output');
  const input = document.createElement(
    definition.unit === 'direction' ? 'select' : 'input',
  );

  label.className = definition.type === 'boolean'
    ? 'fx-toggle-field'
    : 'field fx-range-field';
  label.htmlFor = definition.id;
  heading.className = 'field-label';
  title.dataset.i18n = definition.i18nKey;
  title.textContent = i18n.getMessage(definition.i18nKey);
  output.id = `${definition.id}-value`;
  output.htmlFor = definition.id;
  input.id = definition.id;
  input.dataset.fxPath = definition.path;

  if (definition.unit === 'direction')
  {
    for (const value of [-1, 1])
    {
      const option = document.createElement('option');
      const messageKey = getDirectionMessageKey(definition.path, value);

      option.value = String(value);
      option.dataset.i18n = messageKey;
      option.textContent = i18n.getMessage(messageKey);
      input.appendChild(option);
    }
  }
  else if (definition.type === 'boolean')
  {
    input.type = 'checkbox';
  }
  else
  {
    input.type = 'range';
    input.min = String(definition.min);
    input.max = String(definition.max);
    input.step = String(definition.step);
  }

  heading.append(title, output);
  label.append(heading, input);
  fxControls.set(definition.path, { definition, input, output });

  return label;
}

function createFxGroup(group)
{
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const grid = document.createElement('div');
  const definitions = FX_CONTROL_DEFINITIONS.filter((item) => item.group === group.id);

  details.className = 'fx-group';
  details.open = group.id === 'rings' || group.id === 'trail';
  summary.dataset.i18n = group.i18nKey;
  summary.textContent = i18n.getMessage(group.i18nKey);
  grid.className = 'fx-grid';

  for (const definition of definitions)
  {
    grid.appendChild(createFxControl(definition));
  }

  details.append(summary, grid);
  return details;
}

function buildFxControls()
{
  fxControls.clear();
  elements.clickFxGroups.replaceChildren();
  elements.trailFxGroups.replaceChildren();

  for (const group of FX_CONTROL_GROUPS)
  {
    const target = CLICK_GROUP_NAMES.has(group.id)
      ? elements.clickFxGroups
      : elements.trailFxGroups;

    target.appendChild(createFxGroup(group));
  }
}

function renderFxControls()
{
  const values = flattenFxParams(settings.fxParams, settings.renderMode);

  for (const [path, control] of fxControls)
  {
    const value = values[path];

    if (control.definition.type === 'boolean')
    {
      control.input.checked = value === true;
    }
    else
    {
      control.input.value = String(value);
    }

    control.output.textContent = formatFxValue(control.definition, value);
  }
}

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
  renderFxControls();
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
  elements.quality.value = detectQualityProfile(settings.renderMode, settings.maxDpr);
  elements.renderMode.value = settings.renderMode;
  elements.maxDpr.value = String(settings.maxDpr);
  elements.maxDprValue.textContent = String(settings.maxDpr);
  elements.outputCompositing.value = settings.outputCompositing;
  elements.isolatedCompositing.checked = settings.isolatedCompositing;
  elements.lightBackgroundContrastAlpha.value = String(
    settings.lightBackgroundContrastAlpha,
  );
  elements.lightBackgroundContrastAlphaValue.textContent =
    `${Math.round(settings.lightBackgroundContrastAlpha * 100)}%`;
  elements.clickEnabled.checked = settings.clickEnabled;
  elements.clickTimeScale.value = String(settings.clickTimeScale);
  elements.clickTimeScaleValue.textContent = `${settings.clickTimeScale.toFixed(2)}×`;
  elements.trailEnabled.checked = settings.trailEnabled;
  elements.trailAlways.checked = settings.trailAlways;
  elements.trailAlways.disabled = !settings.trailEnabled;
  elements.trailTimeScale.value = String(settings.trailTimeScale);
  elements.trailTimeScaleValue.textContent = `${settings.trailTimeScale.toFixed(2)}×`;
  elements.languageMode.value = settings.languageMode;
  elements.motionMode.value = settings.motionMode;
  elements.version.textContent = chrome.runtime.getManifest().version;
  renderFxControls();
  renderSites();
}

async function savePatch(patch, successMessageKey = 'statusSaved')
{
  const revision = ++updateRevision;
  const previous = settings;

  settings = normalizeSettings({ ...settings, ...patch });
  render();

  try
  {
    await queueSettingsWrite(patch);

    if (revision === updateRevision)
    {
      showStatus(successMessageKey, 'success');
    }
  }
  catch (error)
  {
    if (revision === updateRevision)
    {
      settings = previous;
      render();
      showStatus('statusSaveFailed', 'error', [error.message]);
    }
  }
}

function saveCustomAppearance(patch)
{
  const appearance = { ...settings, ...patch };

  void savePatch({ ...patch, preset: detectAppearancePreset(appearance) });
}

function getPresetPatch(name, preset)
{
  const qualityPatch = getQualitySettingsPatch(preset.quality);

  return {
    ...preset,
    ...qualityPatch,
    preset: name,
  };
}

function saveRenderCombination(patch)
{
  const renderMode = patch.renderMode ?? settings.renderMode;
  const maxDpr = patch.maxDpr ?? settings.maxDpr;

  // 画质由渲染模式与 DPR 派生；三者原子写入可避免跨设备同步到不一致的组合。
  saveCustomAppearance(
  {
    renderMode,
    maxDpr,
    quality: detectQualityProfile(renderMode, maxDpr),
  });
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

    void savePatch(
      getPresetPatch(elements.preset.value, preset),
      'statusPresetApplied',
    );
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
    if (elements.quality.value === 'custom')
    {
      return;
    }

    saveCustomAppearance(getQualitySettingsPatch(elements.quality.value));
  });

  elements.renderMode.addEventListener('change', () =>
  {
    saveRenderCombination({ renderMode: elements.renderMode.value });
  });

  elements.maxDpr.addEventListener('input', () =>
  {
    elements.maxDprValue.textContent = elements.maxDpr.value;
  });
  elements.maxDpr.addEventListener('change', () =>
  {
    saveRenderCombination({ maxDpr: Number(elements.maxDpr.value) });
  });

  elements.outputCompositing.addEventListener('change', () =>
  {
    void savePatch({ outputCompositing: elements.outputCompositing.value });
  });

  elements.isolatedCompositing.addEventListener('change', () =>
  {
    void savePatch({ isolatedCompositing: elements.isolatedCompositing.checked });
  });

  elements.lightBackgroundContrastAlpha.addEventListener('input', () =>
  {
    elements.lightBackgroundContrastAlphaValue.textContent =
      `${Math.round(Number(elements.lightBackgroundContrastAlpha.value) * 100)}%`;
  });
  elements.lightBackgroundContrastAlpha.addEventListener('change', () =>
  {
    void savePatch(
    {
      lightBackgroundContrastAlpha: Number(elements.lightBackgroundContrastAlpha.value),
    });
  });

  elements.clickEnabled.addEventListener('change', () =>
  {
    void savePatch({ clickEnabled: elements.clickEnabled.checked });
  });
  elements.clickTimeScale.addEventListener('input', () =>
  {
    elements.clickTimeScaleValue.textContent =
      `${Number(elements.clickTimeScale.value).toFixed(2)}×`;
  });
  elements.clickTimeScale.addEventListener('change', () =>
  {
    void savePatch({ clickTimeScale: Number(elements.clickTimeScale.value) });
  });
  elements.trailEnabled.addEventListener('change', () =>
  {
    void savePatch({ trailEnabled: elements.trailEnabled.checked });
  });
  elements.trailAlways.addEventListener('change', () =>
  {
    void savePatch({ trailAlways: elements.trailAlways.checked });
  });
  elements.trailTimeScale.addEventListener('input', () =>
  {
    elements.trailTimeScaleValue.textContent =
      `${Number(elements.trailTimeScale.value).toFixed(2)}×`;
  });
  elements.trailTimeScale.addEventListener('change', () =>
  {
    void savePatch({ trailTimeScale: Number(elements.trailTimeScale.value) });
  });

  const handleFxInput = (event) =>
  {
    const input = event.target.closest('[data-fx-path]');

    if (!input)
    {
      return;
    }

    const control = fxControls.get(input.dataset.fxPath);
    const value = control.definition.type === 'boolean'
      ? input.checked
      : Number(input.value);

    control.output.textContent = formatFxValue(control.definition, value);
  };

  const handleFxChange = (event) =>
  {
    const input = event.target.closest('[data-fx-path]');

    if (!input)
    {
      return;
    }

    const control = fxControls.get(input.dataset.fxPath);
    const value = control.definition.type === 'boolean'
      ? input.checked
      : Number(input.value);
    const path = input.dataset.fxPath;
    const fxParams = { ...settings.fxParams };
    const baseline = getFxParamDefault(path, settings.renderMode);

    if (Object.is(value, baseline))
    {
      delete fxParams[path];
    }
    else
    {
      fxParams[path] = value;
    }

    void savePatch(
    {
      fxParams,
    });
  };

  // input 只提供即时读数；change 才落盘，避免拖动滑块时消耗同步写入额度。
  for (const container of [elements.clickFxGroups, elements.trailFxGroups])
  {
    container.addEventListener('input', handleFxInput);
    container.addEventListener('change', handleFxChange);
  }

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
  buildFxControls();
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
