import assert from 'node:assert/strict';
import test from 'node:test';

import { BAClickFX } from 'ba-click-fx';

class MockHTMLElement
{
}

class MockCanvas extends MockHTMLElement
{
  constructor()
  {
    super();
    this.tagName = 'CANVAS';
    this.style = {};
    this.width = 0;
    this.height = 0;
    this.parentNode = null;
  }

  getContext()
  {
    return new Proxy({},
    {
      get(target, property)
      {
        if (!(property in target))
        {
          target[property] = () =>
          {
          };
        }

        return target[property];
      },
    });
  }

  getBoundingClientRect()
  {
    return {
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    };
  }
}

function installDomMock()
{
  const previous = {
    HTMLElement: globalThis.HTMLElement,
    document: globalThis.document,
    window: globalThis.window,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
  };
  const listeners = new Map();

  globalThis.HTMLElement = MockHTMLElement;
  globalThis.document = {
    createElement(tagName)
    {
      if (tagName === 'canvas')
      {
        return new MockCanvas();
      }

      return new MockHTMLElement();
    },
  };
  globalThis.window = {
    innerWidth: 1280,
    innerHeight: 720,
    devicePixelRatio: 1,
    addEventListener(type, listener)
    {
      listeners.set(`${type}:${listeners.size}`, listener);
    },
    removeEventListener(_type, listener)
    {
      for (const [key, value] of listeners)
      {
        if (value === listener)
        {
          listeners.delete(key);
        }
      }
    },
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () =>
  {
  };

  return {
    listeners,
    restore()
    {
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.document = previous.document;
      globalThis.window = previous.window;
      globalThis.requestAnimationFrame = previous.requestAnimationFrame;
      globalThis.cancelAnimationFrame = previous.cancelAnimationFrame;
    },
  };
}

test('npm 核心包可在插件专属 Canvas 上实例化并销毁', () =>
{
  const environment = installDomMock();
  const canvas = new MockCanvas();

  try
  {
    const effect = new BAClickFX({ target: canvas });

    effect.setColor(25, 150, 255);
    effect.setTrailAlways(true);
    effect.setDpr(1);

    assert.deepEqual(effect.getConfig().color, [25, 150, 255]);
    assert.equal(effect.getConfig().trail.always, true);
    assert.ok(environment.listeners.size > 0);

    effect.destroy();

    assert.equal(environment.listeners.size, 0);
    assert.equal(canvas.parentNode, null);
  }
  finally
  {
    environment.restore();
  }
});

test('关闭拖尾时适配层可阻止上游继续采样轨迹', () =>
{
  const environment = installDomMock();
  const effect = new BAClickFX({ target: new MockCanvas() });

  try
  {
    effect.setTrail(false);
    effect.setTrailAlways(false);
    effect.setMaxShards(0);

    effect._onPointerDown(
    {
      clientX: 120,
      clientY: 90,
      timeStamp: 100,
    });

    const clickSparkCount = effect.sparks.length;

    // 与内容脚本的后置 pointerdown guard 保持一致，锁定当前上游私有状态契约。
    effect.isDown = false;
    effect.clearTrail();
    effect._onPointerMove(
    {
      clientX: 420,
      clientY: 240,
      timeStamp: 116,
    });

    assert.equal(effect.trailStrokes.length, 0);
    assert.equal(effect.sparks.length, clickSparkCount);
  }
  finally
  {
    effect.destroy();
    environment.restore();
  }
});
