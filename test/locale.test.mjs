import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_LOCALE,
  ENGLISH_LOCALE,
  detectLocale,
  selectLocale,
} from '../src/popup/locale.js';

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

test('优先使用浏览器 UI 语言并在缺失时读取标准语言属性', () =>
{
  assert.equal(
    detectLocale({ i18n: { getUILanguage: () => 'ja-JP' } }, { language: 'zh-CN' }),
    ENGLISH_LOCALE,
  );
  assert.equal(
    detectLocale({}, { languages: ['zh-CN', 'en-US'] }),
    DEFAULT_LOCALE,
  );
});
