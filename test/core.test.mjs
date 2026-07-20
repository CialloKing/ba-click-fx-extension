import assert from 'node:assert/strict';
import test from 'node:test';

import { BAClickFX } from 'ba-click-fx';

class MockHTMLElement
{
  constructor()
  {
    this.attributes = new Map();
  }

  setAttribute(name, value)
  {
    this.attributes.set(name, String(value));
  }
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
      const typeListeners = listeners.get(type) || new Set();

      typeListeners.add(listener);
      listeners.set(type, typeListeners);
    },
    removeEventListener(type, listener)
    {
      const typeListeners = listeners.get(type);

      if (!typeListeners)
      {
        return;
      }

      typeListeners.delete(listener);

      if (typeListeners.size === 0)
      {
        listeners.delete(type);
      }
    },
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () =>
  {
  };

  return {
    listeners,
    dispatch(type, event)
    {
      for (const listener of listeners.get(type) || [])
      {
        listener(event);
      }
    },
    listenerCount()
    {
      return [...listeners.values()].reduce((total, values) => total + values.size, 0);
    },
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

    effect.setThemeColor('#1996ff');
    effect.updateConfig({ trailAlways: true });
    effect.updateConfig(
    {
      renderingMode: 'enhanced',
      softwareBloomEnabled: false,
      maxDpr: 1,
    });

    const config = effect.getConfig();

    assert.equal(config.trailAlways, true);
    assert.equal(config.renderingMode, 'enhanced');
    assert.equal(config.softwareBloomEnabled, false);
    assert.equal(config.maxDpr, 1);
    assert.ok(environment.listenerCount() > 0);

    effect.destroy();

    assert.equal(environment.listenerCount(), 0);
    assert.equal(canvas.parentNode, null);
  }
  finally
  {
    environment.restore();
  }
});

test('公开事件路径下关闭拖尾会跳过移动输入且保留点击', () =>
{
  const environment = installDomMock();
  let filteredInputCount = 0;
  const effect = new BAClickFX(
  {
    target: new MockCanvas(),
    inputFilter: () =>
    {
      filteredInputCount++;
      return true;
    },
    trailEnabled: false,
    trailAlways: false,
  });

  try
  {
    environment.dispatch('pointerdown',
    {
      clientX: 120,
      clientY: 90,
      timeStamp: 100,
      pointerId: 1,
    });
    environment.dispatch('pointermove',
    {
      clientX: 420,
      clientY: 240,
      timeStamp: 116,
      pointerId: 1,
    });

    assert.equal(effect.getConfig().trailEnabled, false);
    assert.equal(effect.getConfig().clickEnabled, true);
    assert.equal(filteredInputCount, 1);
  }
  finally
  {
    effect.destroy();
    environment.restore();
  }
});
