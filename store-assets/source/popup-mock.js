(function ()
{
  const params = new URLSearchParams(window.location.search);
  const locale = params.get('lang') === 'zh_CN' ? 'zh_CN' : 'en';
  const state = params.get('state') || 'default';
  const messagesRequest = new XMLHttpRequest();

  messagesRequest.open('GET', `../../_locales/${locale}/messages.json`, false);
  messagesRequest.send();

  const messages = JSON.parse(messagesRequest.responseText.replace(/^\uFEFF/, ''));
  const origin = locale === 'zh_CN' ? 'https://example.cn' : 'https://example.com';
  const overrides = state === 'site-off'
    ? {
      disabledSites:
      {
        [origin]: true,
      },
    }
    : state === 'appearance'
      ? {
        color: '#ff78bd',
        opacity: 0.85,
        scale: 1.55,
        quality: 'high',
      }
      : {};

  function getMessage(key, substitutions = [])
  {
    const definition = messages[key];

    if (!definition)
    {
      return '';
    }

    let value = definition.message;
    const values = Array.isArray(substitutions) ? substitutions : [substitutions];

    for (const [name, placeholder] of Object.entries(definition.placeholders || {}))
    {
      const index = Number(placeholder.content.slice(1)) - 1;

      value = value.replaceAll(`$${name.toUpperCase()}$`, String(values[index] ?? ''));
    }

    return value;
  }

  globalThis.chrome =
  {
    i18n:
    {
      getMessage,
      getUILanguage()
      {
        return locale === 'zh_CN' ? 'zh-CN' : 'en-US';
      },
    },
    runtime:
    {
      lastError: null,
    },
    storage:
    {
      sync:
      {
        get(defaults, callback)
        {
          callback({ ...defaults, ...overrides });
        },
        set(_settings, callback)
        {
          callback();
        },
      },
    },
    tabs:
    {
      query(_query, callback)
      {
        callback([
          {
            id: 1,
            url: `${origin}/gallery`,
          },
        ]);
      },
      sendMessage(_tabId, message, callback)
      {
        if (message.type === 'BA_CLICK_FX_GET_STATUS')
        {
          callback(
          {
            ready: true,
            active: state !== 'site-off',
            siteKey: origin,
          });
          return;
        }

        callback({ ok: true });
      },
    },
  };
})();
