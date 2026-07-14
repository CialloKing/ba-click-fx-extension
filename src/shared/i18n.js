import englishMessages from '../../_locales/en/messages.json';
import chineseMessages from '../../_locales/zh_CN/messages.json';
import {
  DEFAULT_LOCALE,
  resolveLocale,
} from './locale.js';

const MESSAGE_CATALOGS =
{
  en: englishMessages,
  zh_CN: chineseMessages,
};

export function createI18n(languageMode)
{
  const locale = resolveLocale(languageMode);
  const messages = MESSAGE_CATALOGS[locale] || MESSAGE_CATALOGS[DEFAULT_LOCALE];

  function getMessage(key, substitutions = [])
  {
    const values = Array.isArray(substitutions) ? substitutions : [substitutions];
    const definition = messages[key];

    if (!definition?.message)
    {
      return key;
    }

    let localized = definition.message;

    for (const [name, placeholder] of Object.entries(definition.placeholders || {}))
    {
      const index = Number(placeholder.content.slice(1)) - 1;

      localized = localized.replaceAll(
        `$${name.toUpperCase()}$`,
        String(values[index] ?? ''),
      );
    }

    return localized;
  }

  function localizeDocument(documentApi = document)
  {
    documentApi.documentElement.lang = locale === DEFAULT_LOCALE ? 'zh-CN' : 'en';

    for (const element of documentApi.querySelectorAll('[data-i18n]'))
    {
      element.textContent = getMessage(element.dataset.i18n);
    }

    for (const element of documentApi.querySelectorAll('[data-i18n-title]'))
    {
      element.title = getMessage(element.dataset.i18nTitle);
    }

    documentApi.title = getMessage('extensionName');
  }

  return {
    locale,
    getMessage,
    localizeDocument,
  };
}
