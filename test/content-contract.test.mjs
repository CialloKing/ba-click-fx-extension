import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contentSource = await readFile(
  new URL('../src/content.js', import.meta.url),
  'utf8',
);
const popupSource = await readFile(
  new URL('../src/popup/popup.js', import.meta.url),
  'utf8',
);

function countMatches(source, pattern)
{
  return [...source.matchAll(pattern)].length;
}

test('内容脚本使用上游原子参数与运行时状态事件', () =>
{
  assert.equal(countMatches(contentSource, /\bengine\.setFxParams\(/g), 1);
  assert.match(contentSource, /reset:\s*true[\s\S]*strict:\s*true[\s\S]*schemaVersion:/);
  assert.doesNotMatch(contentSource, /\brequiresEngineRebuild\b/);
  assert.doesNotMatch(contentSource, /\bexpandFxParams\b/);
  assert.doesNotMatch(contentSource, /\bengine\.setFxParam\(/);
  assert.doesNotMatch(contentSource, /\bengine\.resetFxConfig\(/);

  assert.match(contentSource, /engine\.updateConfig\(getEngineOptions\(settings\)\)/);
  assert.match(contentSource, /themeColor:\s*settings\.color/);
  for (const field of [
    'overlayAlphaPolicy',
    'overlayColorCompensation',
    'overlayAlphaLimit',
    'hostCompositing',
  ])
  {
    assert.match(contentSource, new RegExp(`${field}:\\s*settings\.${field}`));
  }
  assert.match(contentSource, /hostCompositingSurface:\s*'dom-backdrop'/);
  assert.match(contentSource, /\.\.\.getEngineOptions\(currentSettings\)/);

  for (const eventName of [
    'EFFECT_BACKEND_CHANGE_EVENT',
    'BLOOM_BACKEND_CHANGE_EVENT',
    'HOST_COMPOSITING_CHANGE_EVENT',
  ])
  {
    assert.match(contentSource, new RegExp(`addEventListener\\(\\s*${eventName}`));
    assert.match(contentSource, new RegExp(`removeEventListener\\(\\s*${eventName}`));
  }

  assert.match(
    contentSource,
    /removeEngineListeners\(engine\);\s*engine\.destroy\(\)/,
  );

  for (const field of [
    'requestedEffectBackend',
    'resolvedEffectBackend',
    'requestedBloomBackend',
    'resolvedBloomBackend',
  ])
  {
    assert.match(contentSource, new RegExp(`\\b${field}\\b`));
  }
});

test('弹窗与内容脚本使用相同的消息协议版本', () =>
{
  const protocolPattern = /const MESSAGE_PROTOCOL_VERSION = 3;/;

  assert.match(contentSource, protocolPattern);
  assert.match(popupSource, protocolPattern);
});

test('内容脚本在扩展最外层执行独立宿主混合', () =>
{
  assert.match(
    contentSource,
    /getSurfaceBlendMode\(instance\.getEffectiveHostCompositing\(\)\)/,
  );
  assert.match(
    contentSource,
    /hostContractChanged[\s\S]*?engine\.clear\(\)[\s\S]*?engine\.updateConfig\([\s\S]*?applySurfaceCompositing\(surface, engine\)/,
  );
});
