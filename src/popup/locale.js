export const DEFAULT_LOCALE = 'zh_CN';
export const ENGLISH_LOCALE = 'en';

function readBrowserLanguage(chromeApi, navigatorApi)
{
  try
  {
    const uiLanguage = chromeApi?.i18n?.getUILanguage?.();

    if (typeof uiLanguage === 'string' && uiLanguage.trim())
    {
      return uiLanguage;
    }
  }
  catch
  {
    // 浏览器 API 不可用时继续尝试标准语言属性。
  }

  try
  {
    const languages = Array.isArray(navigatorApi?.languages)
      ? navigatorApi.languages
      : [];
    const language = languages.find((item) => typeof item === 'string' && item.trim()) ||
      navigatorApi?.language;

    if (typeof language === 'string' && language.trim())
    {
      return language;
    }
  }
  catch
  {
    // 检测异常必须落回中文，避免初始化失败阻断弹窗。
  }

  return '';
}

export function selectLocale(language)
{
  if (typeof language !== 'string' || !language.trim())
  {
    return DEFAULT_LOCALE;
  }

  return /^zh(?:[-_]|$)/i.test(language.trim())
    ? DEFAULT_LOCALE
    : ENGLISH_LOCALE;
}

export function detectLocale(
  chromeApi = globalThis.chrome,
  navigatorApi = globalThis.navigator,
)
{
  return selectLocale(readBrowserLanguage(chromeApi, navigatorApi));
}
