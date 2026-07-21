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
  const localOverrides = state === 'site-off'
    ? {
      disabledSites:
      {
        [origin]: true,
      },
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
      openOptionsPage()
      {
      },
    },
    storage:
    {
      onChanged:
      {
        addListener()
        {
        },
      },
      sync:
      {
        get(defaults, callback)
        {
          callback({});
        },
        set(_settings, callback)
        {
          callback();
        },
      },
      local:
      {
        get(_defaults, callback)
        {
          callback({ ...localOverrides, storageSchemaVersion: 4 });
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
            protocolVersion: 2,
            state: 'ready',
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
