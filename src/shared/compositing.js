const INDEPENDENT_HOST_COMPOSITING_MODES = new Set([
  'screen',
  'plus-lighter',
]);

export function getSurfaceBlendMode(settings)
{
  if (settings?.outputCompositing !== 'browser-overlay')
  {
    return 'normal';
  }

  return INDEPENDENT_HOST_COMPOSITING_MODES.has(settings.hostCompositing)
    ? settings.hostCompositing
    : 'normal';
}
