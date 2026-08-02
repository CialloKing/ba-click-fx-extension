import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BAClickFX,
  BLOOM_BACKEND_CHANGE_EVENT,
  EFFECT_BACKEND_CHANGE_EVENT,
  FX_PARAM_SCHEMA_VERSION,
  HOST_COMPOSITING_CHANGE_EVENT,
} from 'ba-click-fx';

class MockHTMLElement
{
  constructor()
  {
    this.attributes = new Map();
    this.children = [];
    this.eventListeners = new Map();
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

  addEventListener(type, listener)
  {
    const listeners = this.eventListeners.get(type) || new Set();

    listeners.add(listener);
    this.eventListeners.set(type, listeners);
  }

  removeEventListener(type, listener)
  {
    const listeners = this.eventListeners.get(type);

    listeners?.delete(listener);

    if (listeners?.size === 0)
    {
      this.eventListeners.delete(type);
    }
  }

  dispatchEvent(event)
  {
    event.target = this;
    event.currentTarget = this;

    for (const listener of this.eventListeners.get(event.type) || [])
    {
      listener.call(this, event);
    }

    return true;
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
    CustomEvent: globalThis.CustomEvent,
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
  globalThis.CustomEvent = class
  {
    constructor(type, options = {})
    {
      this.type = type;
      this.detail = options.detail;
      this.target = null;
      this.currentTarget = null;
    }
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
      globalThis.CustomEvent = previous.CustomEvent;
    },
  };
}

test('npm 核心包可在插件专属 Canvas 上实例化并销毁', () =>
{
  const environment = installDomMock();
  const canvas = new MockCanvas();

  try
  {
    const effect = new BAClickFX(
    {
      target: canvas,
      themeColor: '#1996ff',
      effectBackend: 'canvas2d',
      bloomBackend: 'webgl2',
    });

    effect.updateConfig(
    {
      themeColor: '#4ca7ff',
      trailAlways: true,
      effectBackend: 'canvas2d',
      renderingMode: 'enhanced',
      bloomBackend: 'webgl2',
      maxDpr: 1,
    });

    const config = effect.getConfig();

    assert.equal(config.trailAlways, true);
    assert.equal(config.themeColor, '#4ca7ff');
    assert.equal(config.effectBackend, 'canvas2d');
    assert.equal(config.renderingMode, 'enhanced');
    assert.equal(config.bloomBackend, 'webgl2');
    assert.equal(config.softwareBloomEnabled, false);
    // v1.2.20 只在显式请求时使用 Software Bloom，GPU 不可用时回退原生辉光。
    assert.equal(config.resolvedBloomBackend, 'native');
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

test('后端事件报告 requested 与 resolved 状态且允许监听器清理', () =>
{
  const environment = installDomMock();
  const effect = new BAClickFX(
  {
    target: new MockHTMLElement(),
    effectBackend: 'canvas2d',
    bloomBackend: 'native',
  });
  const effectEvents = [];
  const bloomEvents = [];
  const handleEffect = (event) => effectEvents.push(event.detail);
  const handleBloom = (event) => bloomEvents.push(event.detail);

  try
  {
    const initialConfig = effect.getConfig();

    assert.equal(initialConfig.effectBackend, 'canvas2d');
    assert.equal(initialConfig.resolvedEffectBackend, 'canvas2d');
    assert.equal(initialConfig.bloomBackend, 'native');
    assert.equal(initialConfig.resolvedBloomBackend, 'native');

    effect.canvas.addEventListener(EFFECT_BACKEND_CHANGE_EVENT, handleEffect);
    effect.canvas.addEventListener(BLOOM_BACKEND_CHANGE_EVENT, handleBloom);
    effect.updateConfig(
    {
      effectBackend: 'webgl2',
      bloomBackend: 'webgl2',
    });

    assert.deepEqual(effectEvents.at(-1),
    {
      requestedEffectBackend: 'webgl2',
      resolvedEffectBackend: 'pending',
    });
    assert.deepEqual(bloomEvents.at(-1),
    {
      requestedBloomBackend: 'webgl2',
      resolvedBloomBackend: 'pending',
    });

    effect.canvas.removeEventListener(EFFECT_BACKEND_CHANGE_EVENT, handleEffect);
    effect.canvas.removeEventListener(BLOOM_BACKEND_CHANGE_EVENT, handleBloom);
    const previousEffectEventCount = effectEvents.length;
    const previousBloomEventCount = bloomEvents.length;

    effect.updateConfig(
    {
      effectBackend: 'canvas2d',
      bloomBackend: 'software',
    });

    assert.equal(effectEvents.length, previousEffectEventCount);
    assert.equal(bloomEvents.length, previousBloomEventCount);
  }
  finally
  {
    effect.destroy();
    environment.restore();
  }
});

test('1.2.20 宿主表面解析公开有效混合与降级警告', () =>
{
  const environment = installDomMock();
  const canvas = new MockCanvas();
  const events = [];

  try
  {
    const effect = new BAClickFX(
    {
      target: canvas,
      effectBackend: 'canvas2d',
      bloomBackend: 'native',
      outputCompositing: 'browser-overlay',
      hostCompositing: 'screen',
      hostCompositingSurface: 'native',
    });

    effect.canvas.addEventListener(HOST_COMPOSITING_CHANGE_EVENT, (event) =>
    {
      events.push(event.detail);
    });

    assert.equal(effect.getEffectiveHostCompositing(), 'screen');
    assert.equal(effect.getConfig().resolvedHostCompositing, 'screen');

    effect.updateConfig({ hostCompositingSurface: 'transparent-window' });

    assert.equal(effect.getEffectiveHostCompositing(), 'source-over');
    assert.equal(effect.getConfig().compositingWarning, 'screen-requires-visible-backdrop');
    assert.deepEqual(events.at(-1),
    {
      requestedHostCompositing: 'screen',
      resolvedHostCompositing: 'source-over',
      hostCompositingSurface: 'transparent-window',
      compositingWarning: 'screen-requires-visible-backdrop',
    });

    effect.destroy();
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
    const fxParams =
    {
      'rings.hdrIntensity': 7,
      'bloom.trailEmissionAlpha': 0.5,
      'bloom.trailAlpha': 0.09,
      'hit.enabled': true,
    };

    effect.updateConfig(
    {
      renderingMode: 'legacy',
      bloomBackend: 'native',
      maxDpr: 1,
    });
    const legacyResult = effect.setFxParams(fxParams,
    {
      reset: true,
      strict: true,
      schemaVersion: FX_PARAM_SCHEMA_VERSION,
    });

    assert.equal(legacyResult.committed, true);
    assert.equal(effect.getConfig().renderingMode, 'legacy');
    assert.equal(effect.getConfig().maxDpr, 1);
    assert.equal(effect.getFxConfig().rings.hdrIntensity, 7);
    // 未覆盖参数必须恢复上游公开的 Legacy 模式基线。
    assert.equal(effect.getFxConfig().rings.widthStart, 1);
    assert.equal(effect.getFxConfig().trail.width, 4);
    assert.equal(effect.getFxConfig().bloom.trailEmissionAlpha, 0.5);
    assert.equal(effect.getFxConfig().bloom.trailAlpha, 0.09);
    assert.equal(effect.getFxConfig().hit.enabled, true);
    // 根粒子时长只是对象池元数据，不再属于公开视觉参数。
    assert.equal(effect.getFxConfig().rootDurationMs, 1000);

    effect.updateConfig(
    {
      renderingMode: 'enhanced',
      bloomBackend: 'webgl2',
      maxDpr: 2,
    });
    const enhancedResult = effect.setFxParams(fxParams,
    {
      reset: true,
      strict: true,
      schemaVersion: FX_PARAM_SCHEMA_VERSION,
    });

    assert.equal(enhancedResult.committed, true);
    assert.equal(effect.getConfig().renderingMode, 'enhanced');
    assert.equal(effect.getConfig().bloomBackend, 'webgl2');
    assert.equal(effect.getConfig().maxDpr, 2);
    assert.equal(effect.getFxConfig().rings.hdrIntensity, 7);
    assert.equal(effect.getFxConfig().rings.rotationDirection, -1);
    assert.equal(effect.getFxConfig().trail.width, 2.7);

    const beforeRejectedPatch = effect.getFxConfig();
    const rejectedResult = effect.setFxParams(
    {
      'rings.hdrIntensity': 2,
      'rings.notReal': 1,
    },
    {
      reset: true,
      strict: true,
      schemaVersion: FX_PARAM_SCHEMA_VERSION,
    });

    assert.equal(rejectedResult.committed, false);
    assert.deepEqual(effect.getFxConfig(), beforeRejectedPatch);

    // 从稀疏覆盖中删除字段时，内容脚本会先重置，不能遗留旧实例参数。
    const resetResult = effect.setFxParams({},
    {
      reset: true,
      strict: true,
      schemaVersion: FX_PARAM_SCHEMA_VERSION,
    });

    assert.equal(resetResult.committed, true);
    assert.equal(effect.getFxConfig().rings.hdrIntensity, 5.992157);
    assert.equal(effect.getFxConfig().hit.enabled, false);
  }
  finally
  {
    effect.destroy();
    environment.restore();
  }
});
