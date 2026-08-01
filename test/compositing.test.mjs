import assert from 'node:assert/strict';
import test from 'node:test';

import { getSurfaceBlendMode } from '../src/shared/compositing.js';

test('独立宿主载荷在最外层执行一次网页混合', () =>
{
  assert.equal(getSurfaceBlendMode(
  {
    outputCompositing: 'browser-overlay',
    hostCompositing: 'screen',
  }), 'screen');
  assert.equal(getSurfaceBlendMode(
  {
    outputCompositing: 'browser-overlay',
    hostCompositing: 'plus-lighter',
  }), 'plus-lighter');
});

test('Scene 与 Source-over 不修改最外层宿主混合', () =>
{
  assert.equal(getSurfaceBlendMode(
  {
    outputCompositing: 'scene',
    hostCompositing: 'screen',
  }), 'normal');
  assert.equal(getSurfaceBlendMode(
  {
    outputCompositing: 'browser-overlay',
    hostCompositing: 'source-over',
  }), 'normal');
  assert.equal(getSurfaceBlendMode(), 'normal');
});
