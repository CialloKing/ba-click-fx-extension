const INDEPENDENT_HOST_COMPOSITING_MODES = new Set([
  'screen',
  'plus-lighter',
]);

export function getSurfaceBlendMode(resolvedHostCompositing)
{
  return INDEPENDENT_HOST_COMPOSITING_MODES.has(resolvedHostCompositing)
    ? resolvedHostCompositing
    : 'normal';
}
