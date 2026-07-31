import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  FX_CONTROL_DEFINITIONS,
  FX_CONTROL_GROUPS,
} from '../src/shared/fx-settings.js';
import {
  DEFAULT_LOCALE,
  ENGLISH_LOCALE,
  detectLocale,
  resolveLocale,
  selectLocale,
} from '../src/shared/locale.js';

const LOCALE_FILES = Object.freeze(
{
  zh_CN: new URL('../_locales/zh_CN/messages.json', import.meta.url),
  en: new URL('../_locales/en/messages.json', import.meta.url),
});

const ADVANCED_SETTING_KEYS = Object.freeze([
  'renderFullWebGL2',
  'outputCompositing',
  'outputCompositingScene',
  'outputCompositingBrowserOverlay',
  'overlayAlphaPolicy',
  'overlayAlphaPolicyCoverage',
  'overlayAlphaPolicyVisualMax',
  'overlayColorCompensation',
  'overlayColorCompensationNone',
  'overlayColorCompensationBrightCore',
  'overlayAlphaLimit',
  'overlayAlphaLimitDescription',
  'hostCompositing',
  'hostCompositingSourceOver',
  'hostCompositingPlusLighter',
  'isolatedCompositing',
  'isolatedCompositingDescription',
  'lightBackgroundContrastAlpha',
  'lightBackgroundContrastAlphaDescription',
  'clickTimeScale',
  'trailTimeScale',
  'timeScaleDescription',
  'fxAdvancedSettingsTitle',
  'fxAdvancedSettingsDescription',
  'directionNegative',
  'directionPositive',
  'unitMilliseconds',
  'unitCount',
  'unitMultiplier',
  'unitPixels',
  'unitPixelsPerSecond',
  'unitSamples',
  'unitRatio',
  'unitScalar',
  'unitGammaHdr',
  'unitLinearHdr',
]);

function readMessages(url)
{
  // Chrome locale 文件沿用仓库的 UTF-8 BOM，测试解析时显式去除。
  return JSON.parse(readFileSync(url, 'utf8').replace(/^\uFEFF/, ''));
}

test('中文语言环境使用中文', () =>
{
  assert.equal(selectLocale('zh-CN'), DEFAULT_LOCALE);
  assert.equal(selectLocale('zh-Hant'), DEFAULT_LOCALE);
  assert.equal(selectLocale('zh_CN'), DEFAULT_LOCALE);
});

test('非中文语言环境统一使用英文', () =>
{
  assert.equal(selectLocale('en-US'), ENGLISH_LOCALE);
  assert.equal(selectLocale('ja-JP'), ENGLISH_LOCALE);
  assert.equal(selectLocale('fr'), ENGLISH_LOCALE);
});

test('语言检测失败时回退中文', () =>
{
  const throwingChrome =
  {
    i18n:
    {
      getUILanguage()
      {
        throw new Error('unavailable');
      },
    },
  };
  const throwingNavigator = {};

  Object.defineProperty(throwingNavigator, 'languages',
  {
    get()
    {
      throw new Error('unavailable');
    },
  });

  assert.equal(detectLocale(throwingChrome, throwingNavigator), DEFAULT_LOCALE);
  assert.equal(detectLocale({}, {}), DEFAULT_LOCALE);
});

test('优先使用浏览器 UI 语言并允许设置页显式覆盖', () =>
{
  assert.equal(
    detectLocale({ i18n: { getUILanguage: () => 'ja-JP' } }, { language: 'zh-CN' }),
    ENGLISH_LOCALE,
  );
  assert.equal(
    detectLocale({}, { languages: ['zh-CN', 'en-US'] }),
    DEFAULT_LOCALE,
  );
  assert.equal(resolveLocale('zh_CN', {}, { language: 'en-US' }), DEFAULT_LOCALE);
  assert.equal(resolveLocale('en', {}, { language: 'zh-CN' }), ENGLISH_LOCALE);
});

test('中英文消息键保持一致且高级设置文案完整', () =>
{
  const entries = Object.entries(LOCALE_FILES).map(([locale, url]) =>
    [locale, readMessages(url)]);
  const [firstLocale, firstMessages] = entries[0];
  const firstKeys = Object.keys(firstMessages).sort();

  for (const [locale, messages] of entries)
  {
    assert.deepEqual(
      Object.keys(messages).sort(),
      firstKeys,
      `${locale} 与 ${firstLocale} 的消息键应一致`,
    );

    for (const key of ADVANCED_SETTING_KEYS)
    {
      assert.equal(
        typeof messages[key]?.message === 'string' &&
          messages[key].message.trim().length > 0,
        true,
        `${locale}.${key} 应提供非空文案`,
      );
    }
  }
});

test('全部 Schema 控件都有中英文名称', () =>
{
  assert.equal(FX_CONTROL_GROUPS.length, 7);
  assert.equal(FX_CONTROL_DEFINITIONS.length, 65);

  const schemaKeys = [
    ...FX_CONTROL_GROUPS.map(({ i18nKey }) => i18nKey),
    ...FX_CONTROL_DEFINITIONS.map(({ i18nKey }) => i18nKey),
  ];

  assert.equal(new Set(schemaKeys).size, 72);

  for (const [locale, url] of Object.entries(LOCALE_FILES))
  {
    const messages = readMessages(url);

    for (const key of schemaKeys)
    {
      assert.equal(
        typeof messages[key]?.message === 'string' &&
          messages[key].message.trim().length > 0,
        true,
        `${locale}.${key} 应提供非空名称`,
      );
    }
  }
});
