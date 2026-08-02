import assert from 'node:assert/strict';
import test from 'node:test';

import { getSurfaceBlendMode } from '../src/shared/compositing.js';

test('独立宿主载荷在最外层执行一次网页混合', () =>
{
  assert.equal(getSurfaceBlendMode('screen'), 'screen');
  assert.equal(getSurfaceBlendMode('plus-lighter'), 'plus-lighter');
});

test('核心解析为 Source-over 时恢复普通外层混合', () =>
{
  assert.equal(getSurfaceBlendMode('source-over'), 'normal');
  assert.equal(getSurfaceBlendMode(), 'normal');
});
