(function ()
{
  const params = new URLSearchParams(window.location.search);
  const locale = params.get('lang') === 'zh_CN' ? 'zh_CN' : 'en';
  const messagesRequest = new XMLHttpRequest();

  messagesRequest.open('GET', `../../_locales/${locale}/messages.json`, false);
  messagesRequest.send();

  const messages = JSON.parse(messagesRequest.responseText.replace(/^\uFEFF/, ''));
  const syncValues =
  {
    color: '#8edcff',
    opacity: 0.35,
    scale: 0.9,
    quality: 'balanced',
    preset: 'soft',
    languageMode: locale,
    motionMode: 'system',
  };
  const localValues =
  {
    disabledSites:
    {
      'https://example.com': true,
      'https://news.example': true,
    },
    storageSchemaVersion: 2,
  };

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

  function selectValues(values, keys)
  {
    return Object.fromEntries(
      keys.filter((key) => Object.hasOwn(values, key)).map((key) => [key, values[key]]),
    );
  }

  function createArea(values)
  {
    return {
      get(keys, callback)
      {
        callback(selectValues(values, Array.isArray(keys) ? keys : Object.keys(keys || {})));
      },
      set(patch, callback)
      {
        Object.assign(values, patch);
        callback();
      },
      remove(keys, callback)
      {
        for (const key of Array.isArray(keys) ? keys : [keys])
        {
          delete values[key];
        }

        callback();
      },
    };
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
      getManifest()
      {
        return { version: '1.0.6' };
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
      sync: createArea(syncValues),
      local: createArea(localValues),
    },
  };
})();
