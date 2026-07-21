import assert from 'node:assert/strict';
import test from 'node:test';

import { BAClickFX } from 'ba-click-fx';
import { expandFxParams } from '../src/shared/fx-settings.js';

class MockHTMLElement
{
  constructor()
  {
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.style =
    {
      setProperty(property, value)
      {
        this[property] = value;
      },
    };
  }

  setAttribute(name, value)
  {
    this.attributes.set(name, String(value));
  }

  appendChild(child)
  {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  removeChild(child)
  {
    this.children = this.children.filter((item) => item !== child);
    child.parentNode = null;
    return child;
  }

  remove()
  {
    this.parentNode?.removeChild(this);
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

class MockCanvas extends MockHTMLElement
{
  constructor()
  {
    super();
    this.tagName = 'CANVAS';
    this.width = 0;
    this.height = 0;
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
      bloomBackend: 'webgl2',
      maxDpr: 1,
    });

    const config = effect.getConfig();

    assert.equal(config.trailAlways, true);
    assert.equal(config.renderingMode, 'enhanced');
    assert.equal(config.bloomBackend, 'webgl2');
    assert.equal(config.softwareBloomEnabled, true);
    // 已有 Canvas 无法挂载 WebGL2 叠层，核心应立即选择软件 Bloom 作为回退。
    assert.equal(config.resolvedBloomBackend, 'software');
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

test('完整设置可按重置、渲染模式和稀疏覆盖的顺序实时应用', () =>
{
  const environment = installDomMock();
  const effect = new BAClickFX({ target: new MockHTMLElement() });

  try
  {
    const fxParams = expandFxParams(
    {
      'rings.hdrIntensity': 7,
      'bloom.trailEmissionAlpha': 0.5,
      'hit.enabled': true,
      'rootDurationMs': 1500,
    });

    effect.updateConfig(
    {
      renderingMode: 'legacy',
      bloomBackend: 'native',
      maxDpr: 1,
    });
    effect.resetFxConfig();
    effect.updateConfig(
    {
      renderingMode: 'enhanced',
      bloomBackend: 'native',
      maxDpr: 1,
    });
    effect.updateConfig(
    {
      renderingMode: 'legacy',
      bloomBackend: 'native',
      maxDpr: 1,
    });

    for (const [path, value] of Object.entries(fxParams))
    {
      effect.setFxParam(path, value);
    }

    assert.equal(effect.getConfig().renderingMode, 'legacy');
    assert.equal(effect.getConfig().maxDpr, 1);
    assert.equal(effect.getFxConfig().rings.hdrIntensity, 7);
    // 未覆盖参数必须保留 Legacy 的内部兼容映射。
    assert.equal(effect.getFxConfig().rings.widthStart, 5.2);
    assert.equal(effect.getFxConfig().bloom.trailEmissionAlpha, 0.5);
    assert.equal(effect.getFxConfig().bloom.trailAlpha, 0.09);
    assert.equal(effect.getFxConfig().hit.enabled, true);
    // 1.2.7 暂未读取 rootDurationMs，但公开 setter 仍应保留此配置值。
    assert.equal(effect.getFxConfig().rootDurationMs, 1500);

    effect.updateConfig(
    {
      renderingMode: 'enhanced',
      bloomBackend: 'webgl2',
      maxDpr: 2,
    });
    effect.resetFxConfig();

    for (const [path, value] of Object.entries(fxParams))
    {
      effect.setFxParam(path, value);
    }

    assert.equal(effect.getConfig().renderingMode, 'enhanced');
    assert.equal(effect.getConfig().bloomBackend, 'webgl2');
    assert.equal(effect.getConfig().maxDpr, 2);
    assert.equal(effect.getFxConfig().rings.hdrIntensity, 7);
    assert.equal(effect.getFxConfig().rings.rotationDirection, -1);

    // 从稀疏覆盖中删除字段时，内容脚本会先重置，不能遗留旧实例参数。
    effect.updateConfig(
    {
      renderingMode: 'enhanced',
      bloomBackend: 'webgl2',
      maxDpr: 2,
    });
    effect.resetFxConfig();

    assert.equal(effect.getFxConfig().rings.hdrIntensity, 5.992157);
    assert.equal(effect.getFxConfig().hit.enabled, false);
  }
  finally
  {
    effect.destroy();
    environment.restore();
  }
});
