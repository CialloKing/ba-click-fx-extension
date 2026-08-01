import { flattenFxParams } from '../shared/fx-settings.js';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
} from '../shared/settings.js';

const NON_EFFECT_SETTING_KEYS = new Set([
  'languageMode',
  'motionMode',
]);

export const DEFAULT_EFFECT_SETTINGS = Object.freeze(
  Object.fromEntries(Object.entries(DEFAULT_SYNC_SETTINGS).filter(([key]) =>
    !NON_EFFECT_SETTING_KEYS.has(key))),
);

export function getDefaultFxParam(path, renderMode = DEFAULT_SETTINGS.renderMode)
{
  return flattenFxParams(DEFAULT_EFFECT_SETTINGS.fxParams, renderMode)[path];
}

export function getCompositingControlState(value = DEFAULT_SETTINGS)
{
  const browserOverlayEnabled = value.outputCompositing === 'browser-overlay';
  const sourceOverEnabled = browserOverlayEnabled &&
    value.hostCompositing === 'source-over';
  const independentHostCompositing = browserOverlayEnabled && !sourceOverEnabled;

  return {
    alphaControlsEnabled: sourceOverEnabled,
    hostCompositingEnabled: browserOverlayEnabled,
    isolatedCompositingEnabled: !independentHostCompositing,
    lightBackgroundContrastEnabled: !browserOverlayEnabled,
  };
}
