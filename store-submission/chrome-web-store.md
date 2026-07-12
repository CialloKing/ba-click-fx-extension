# Chrome Web Store Submission

## Product details

- Name from Manifest: `BA Click FX`
- Suggested category: `Fun` or the closest current visual-customization category available in the dashboard
- Default locale: Simplified Chinese (`zh_CN`)
- Additional locale: English
- Homepage: https://ba-click-fx.cialloking.top/
- Support URL: https://github.com/CialloKing/ba-click-fx-extension/issues
- Privacy policy: https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md
- Visibility for first public release: `Public`

The Manifest name cannot be overridden in the dashboard. Keep the listing name exactly `BA Click FX`.

## English detailed description

```text
BA Click FX is an unofficial, fan-made visual-effects extension for ordinary webpages.

It adds blue-themed, game-inspired click rings, particle fragments, and a cursor light trail. The effects are rendered locally with Canvas 2D and can be adjusted from the toolbar popup.

Features:
• Enable or disable click effects and cursor trails independently
• Enable or disable the extension for the current website
• Adjust theme color, opacity, effect size, and quality
• Synchronize visual and site preferences through browser extension storage
• Release Canvas resources while a tab is in the background
• Work offline with no developer server or remotely hosted code

Privacy and local processing:
• Pointer coordinates and click/move events are processed temporarily in memory only to draw visible effects
• The current website origin is processed locally for the per-site switch
• A website origin is saved only when you explicitly disable that website
• The developer does not receive browsing activity, pointer data, or saved preferences
• No ads, analytics, telemetry, profiling, page-content collection, or network requests

Known limitations:
• Browser internal pages, extension stores, and some built-in viewers do not allow content scripts
• Effects are intentionally limited to top-level documents, so events inside some iframes are not displayed
• Local file pages require the user to enable file URL access in the browser extension settings

BA Click FX is not affiliated with or endorsed by Nexon, NEXON Games, Yostar, or the Blue Archive project. No official game logos, characters, screenshots, or assets are included.
```

## 简体中文详细描述

```text
BA Click FX 是一个非官方的网页视觉特效插件。

安装后，普通网页会显示蓝色游戏风格的鼠标点击圆环、粒子碎片和光标拖尾。所有特效均使用 Canvas 2D 在本地渲染，可通过工具栏弹窗调整。

主要功能：
• 点击特效与光标拖尾可分别开关
• 可为当前网站单独启用或禁用
• 可调整主题颜色、不透明度、特效大小和画质
• 视觉设置与站点规则通过浏览器扩展存储同步
• 标签页进入后台时会释放 Canvas 资源
• 无需开发者服务器或远程代码，离线也能运行

隐私与本地处理：
• 鼠标坐标和点击/移动事件只在内存中临时处理，用于绘制用户可见的特效
• 当前网站 origin 只在本地用于站点开关
• 只有当用户主动关闭某个网站时，该网站 origin 才会保存
• 开发者不会收到浏览活动、鼠标数据或保存的设置
• 不包含广告、分析、遥测、画像、网页内容收集或网络请求

已知限制：
• 浏览器内部页面、扩展商店和部分内置查看器禁止内容脚本运行
• 插件只注入顶层文档，部分 iframe 内的鼠标事件不会显示特效
• 本地文件页面需要用户在扩展设置中主动开启文件网址访问权限

BA Click FX 是非官方粉丝项目，与 Nexon、NEXON Games、Yostar 或《蔚蓝档案》官方不存在隶属、合作或认可关系。插件不包含官方游戏 Logo、角色、截图或素材。
```

## Privacy fields

### Single purpose

English:

```text
Display configurable pointer click animations and cursor trails on ordinary webpages.
```

简体中文：

```text
在普通网页上显示可配置的鼠标点击动画和光标拖尾。
```

### Permission justifications

`storage`:

```text
Stores global effect settings, visual parameters, quality selection, and origins that the user explicitly disables. Values are kept in the browser-provided sync storage. The developer has no server and cannot access them.
```

`activeTab`:

```text
Used only after the user opens the extension popup to identify the active website, display its hostname, apply the current-site control, and send a user-requested preview message to that tab.
```

Host access for `http://*/*` and `https://*/*`:

```text
The extension's single purpose requires a content script on ordinary webpages so it can receive pointer events and draw a pointer-events:none Canvas overlay. It does not read or transmit page text, forms, cookies, credentials, or account data.
```

Host access for `file:///*`:

```text
Allows the same visual effects on local HTML files only after the user explicitly enables file URL access in the browser's extension settings. File contents are not read or transmitted.
```

### Remote code

Select:

```text
No, I am not using remote code.
```

Supporting explanation if requested:

```text
All executable code, including ba-click-fx, is bundled into content.js and popup.js at build time. The extension makes no network requests and does not use eval, new Function, remote scripts, WebAssembly fetched at runtime, or a CDN.
```

### Data usage

Use the conservative disclosure below so the dashboard, privacy policy, store description, and actual code remain consistent.

Select data types:

- `Web history`: the current origin is processed locally for the site switch; origins explicitly disabled by the user are stored as rules. The extension does not build or retain a visit history.
- `User activity`: pointer positions and click/move events are processed transiently in memory to render effects. They are never logged or retained.

Do not select:

- personally identifiable information;
- health information;
- financial and payment information;
- authentication information;
- personal communications;
- location;
- website content; or
- any other category not listed above.

Certify all applicable Limited Use statements:

- data is used only for the extension's single purpose;
- data is not sold or transferred to third parties;
- data is not used for advertising, profiling, creditworthiness, or lending;
- humans do not read user data; and
- the disclosures match the privacy policy.

Additional explanation if requested:

```text
The disclosed values are processed locally or stored through chrome.storage.sync. BA Click FX has no developer-operated backend, analytics, telemetry, ads, or network requests. The developer cannot access the values.
```

## Store assets

- Logo: `store-assets/common/logo-300.png`
- Small promo: `store-assets/common/promo-small-440x280.png`
- Optional marquee: `store-assets/common/promo-marquee-1400x560.png`
- English screenshots: upload all four files from `store-assets/en/`
- Simplified Chinese screenshots: select the `zh_CN` listing locale and upload all four files from `store-assets/zh_CN/`

Screenshot order:

1. Click rings, particles, and cursor trail
2. Complete popup controls
3. Per-site enable/disable control
4. Appearance and quality customization

## Distribution

- Visibility: `Public`
- Regions: all regions unless there is a specific legal or support reason to exclude one
- Pricing: free
- In-app purchases: none
- Mature content: no
