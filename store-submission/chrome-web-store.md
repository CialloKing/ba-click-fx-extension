# Chrome Web Store Submission

## Submitted release

- Extension version: `1.0.2`
- Core dependency: `ba-click-fx 1.1.6`
- Manifest version: `3`
- Submission status: Submitted for review
- Visibility: `Public`
- Remote code: `No`
- Disclosed data types:
  - `Web history`
  - `User activity`
- Package: `ba-click-fx-extension-v1.0.2-chromium.zip`
- SHA-256: `1692087AD7FC985607525344C16CC2886CB66F28C1A01311628F363A963A2423`

This section records the actual `v1.0.2` submission. Append later review results or version submissions here instead of rewriting the historical record.

## Prepared update — v1.0.5

- Extension version: `1.0.5`
- Core dependency: `ba-click-fx 1.1.11`
- Manifest version: `3`
- Submission status: Prepared; not yet uploaded to Chrome Web Store
- Visibility: `Public`
- Remote code: `No`
- Disclosed data types remain:
  - `Web history`
  - `User activity`
- Package: `ba-click-fx-extension-v1.0.5-chromium.zip`
- SHA-256: `83F832DC556C4627C93BFA5827C3EE04857117AC8D4D51C97DD8A39275BFA6E0`
- Version note: `v1.0.4` is intentionally skipped; all planned v1.0.4 and v1.0.5 changes ship together in v1.0.5.

Update highlights:

- Uses `ba-click-fx 1.1.11` public trail cleanup and backing-store budget APIs; no private core state is accessed.
- Adds a full options page, three appearance presets, explicit language and motion preferences, and local website-rule management.
- Migrates site-specific disable rules from sync storage to local storage without deleting the legacy synced copy automatically.
- Stops tracking generated `dist`; the reviewed ZIP remains fully bundled and contains no remote code.

## Chromium package generated with v1.0.6

- Extension version: `1.0.6`
- Core dependency: `ba-click-fx 1.1.11`
- Package: `ba-click-fx-extension-v1.0.6-chromium.zip`
- SHA-256: `1F8B43B8F78177866BB4849357AB2E3F13BD84410044FB379E8D9DED3EF088F8`
- Chrome Web Store status: Not submitted as part of the Firefox release

`v1.0.6` adds the separate Firefox/AMO build, source package, validation, and submission materials. Chromium permissions, runtime behavior, storage schema, and listing copy are unchanged from `v1.0.5`. If Chrome has not yet received the v1.0.5 update, upload the newer v1.0.6 Chromium package and use the v1.0.5 description below. Do not upload the Firefox ZIP to Chrome Web Store.

### v1.0.5 listing-description replacement — prepared, not yet submitted

Use these blocks to replace the v1.0.2 dashboard descriptions when uploading v1.0.5. After submission, relabel them as the actual submitted version and copy back any dashboard edits.

```text
BA Click FX is an unofficial, fan-made visual-effects extension for ordinary webpages.

It adds game-inspired click rings, particle fragments, and a theme-colored cursor light trail. Effects are rendered locally with Canvas 2D. Quick controls are available in the toolbar popup, while the full settings page manages appearance, performance, language, motion preferences, and disabled websites.

Features:
• Enable or disable click effects and cursor trails independently
• Enable or disable the extension for the current website
• Choose Classic, Soft, or Power-saving appearance presets
• Adjust theme color, opacity, effect size, and quality
• Follow the system language or choose Simplified Chinese or English
• Follow the system reduced-motion preference or choose full/reduced continuous motion
• Search, remove, or clear locally saved website rules
• Release Canvas resources while a tab is in the background
• Work offline with no developer server or remotely hosted code

How to use:
1. Install or update the extension and open or refresh an ordinary HTTP/HTTPS webpage.
2. Click the webpage to display rings and particle fragments.
3. Move or drag the pointer to display the cursor trail.
4. Open the toolbar popup for quick controls, or select Full settings for all preferences and website rules.

Privacy and local processing:
• Pointer coordinates and click/move events are processed temporarily in memory only to draw visible effects
• The current website origin is processed locally for the per-site switch
• Website origins explicitly disabled by the user are saved in local extension storage
• Visual, interface, and motion preferences use browser-provided sync storage and may synchronize only when browser sync is enabled
• The developer does not receive browsing activity, pointer data, or saved preferences
• No ads, analytics, telemetry, profiling, page-content collection, or network requests

Known limitations:
• Browser internal pages, extension stores, and some built-in viewers do not allow content scripts
• Effects are intentionally limited to top-level documents, so events inside some iframes are not displayed
• Local file pages require the user to enable file URL access in browser extension settings

BA Click FX is not affiliated with or endorsed by Nexon, NEXON Games, Yostar, or the Blue Archive project. No official game logos, characters, screenshots, or assets are included.
```

```text
BA Click FX 是一个非官方的网页视觉特效扩展。

安装后，普通网页会显示游戏风格的鼠标点击圆环、粒子碎片和主题色光标拖尾。所有特效均使用 Canvas 2D 在本地渲染。工具栏弹窗提供常用开关，完整设置页可管理外观、性能、语言、动态偏好和已禁用网站。

主要功能：
• 点击特效与光标拖尾可分别开关
• 可为当前网站单独启用或禁用
• 可选择经典、柔和或省电外观预设
• 可调整主题颜色、不透明度、特效大小和画质
• 可跟随系统语言，或指定简体中文/英文
• 可跟随系统减少动态偏好，或指定完整/减少持续动态
• 可搜索、移除或清空本机网站规则
• 标签页进入后台时会释放 Canvas 资源
• 无需开发者服务器或远程代码，离线也能运行

使用方法：
1. 安装或更新扩展，然后打开或刷新普通 HTTP/HTTPS 网页。
2. 点击网页，显示圆环和粒子碎片。
3. 移动或拖动鼠标，显示光标拖尾。
4. 打开工具栏弹窗使用常用开关，或进入“完整设置”管理全部偏好和网站规则。

隐私与本地处理：
• 鼠标坐标和点击/移动事件只在内存中临时处理，用于绘制用户可见的特效
• 当前网站 origin 只在本地用于站点开关
• 用户主动禁用的网站 origin 保存在本机扩展存储
• 视觉、界面和动态偏好使用浏览器同步存储；只有启用浏览器同步时才可能跨设备同步
• 开发者不会收到浏览活动、鼠标数据或保存的设置
• 不包含广告、分析、遥测、画像、网页内容收集或网络请求

已知限制：
• 浏览器内部页面、扩展商店和部分内置查看器禁止内容脚本运行
• 扩展只注入顶层文档，部分 iframe 内的鼠标事件不会显示特效
• 本地文件页面需要用户在扩展设置中主动开启文件网址访问权限

BA Click FX 是非官方粉丝项目，与 Nexon、NEXON Games、Yostar 或《蔚蓝档案》官方不存在隶属、合作或认可关系。扩展不包含官方游戏 Logo、角色、截图或素材。
```

## Product details

- Name from Manifest: `BA Click FX`
- Submitted category: `Functionality & UI` / `功能与界面`
- Default locale: Simplified Chinese (`zh_CN`)
- Additional locale: English
- Verified official website: https://ba-click-fx.cialloking.top/
- Homepage URL: https://github.com/CialloKing/ba-click-fx-extension
- Support URL: https://github.com/CialloKing/ba-click-fx-extension/issues
- Privacy policy URL: https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md
- Visibility: `Public`

The Manifest name cannot be overridden in the dashboard. Keep the listing name exactly `BA Click FX`.

## English detailed description — submitted

The following code block is the product description submitted for `v1.0.2`. If the dashboard text is edited during review, copy the final dashboard version back here verbatim.

```text
BA Click FX is an unofficial, fan-made visual-effects extension for ordinary webpages.

It adds blue-themed, game-inspired click rings, particle fragments, and a cursor light trail. The effects are rendered locally with Canvas 2D and can be adjusted from the toolbar popup.

Features:
• Enable or disable click effects and cursor trails independently
• Enable or disable the extension for the current website
• Adjust theme color, opacity, effect size, and quality
• Save visual preferences and per-site rules using browser-provided extension storage
• Release Canvas resources while a tab is in the background
• Work offline with no developer server or remotely hosted code

How to use:
1. Install the extension and open or refresh an ordinary HTTP/HTTPS webpage.
2. Click the webpage to display rings and particle fragments.
3. Move or drag the pointer to display the cursor trail.
4. Open the toolbar popup to adjust effects or disable the current website.

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

## 简体中文详细描述——实际提交版本

以下代码块记录 `v1.0.2` 提交的商品说明。如果审核期间在后台修改了文字，应把最终后台版本原样同步回此处。

```text
BA Click FX 是一个非官方的网页视觉特效扩展。

安装后，普通网页会显示蓝色游戏风格的鼠标点击圆环、粒子碎片和光标拖尾。所有特效均使用 Canvas 2D 在本地渲染，可通过工具栏弹窗调整。

主要功能：
• 点击特效与光标拖尾可分别开关
• 可为当前网站单独启用或禁用
• 可调整主题颜色、不透明度、特效大小和画质
• 通过浏览器提供的扩展存储保存视觉设置与站点规则
• 标签页进入后台时会释放 Canvas 资源
• 无需开发者服务器或远程代码，离线也能运行

使用方法：
1. 安装扩展，然后打开或刷新普通 HTTP/HTTPS 网页。
2. 点击网页，显示圆环和粒子碎片。
3. 移动或拖动鼠标，显示光标拖尾。
4. 打开工具栏弹窗，调整特效或为当前网站关闭扩展。

隐私与本地处理：
• 鼠标坐标和点击/移动事件只在内存中临时处理，用于绘制用户可见的特效
• 当前网站 origin 只在本地用于站点开关
• 只有当用户主动关闭某个网站时，该网站 origin 才会保存
• 开发者不会收到浏览活动、鼠标数据或保存的设置
• 不包含广告、分析、遥测、画像、网页内容收集或网络请求

已知限制：
• 浏览器内部页面、扩展商店和部分内置查看器禁止内容脚本运行
• 扩展只注入顶层文档，部分 iframe 内的鼠标事件不会显示特效
• 本地文件页面需要用户在扩展设置中主动开启文件网址访问权限

BA Click FX 是非官方粉丝项目，与 Nexon、NEXON Games、Yostar 或《蔚蓝档案》官方不存在隶属、合作或认可关系。扩展不包含官方游戏 Logo、角色、截图或素材。
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
Stores global effect settings, visual parameters, quality, language, and motion preferences using browser-provided sync storage. Website origins that the user explicitly disables are stored in local extension storage. During the v1.0.5 upgrade, existing legacy synced origins are copied to local storage and retained in sync storage until the user explicitly removes that legacy copy. If browser synchronization is enabled, the browser provider may synchronize sync-storage values between signed-in browser instances. The developer has no server and cannot access any stored values.
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
All executable code, including ba-click-fx, is bundled into content.js, popup.js, and options.js at build time. The extension makes no network requests and does not use eval, new Function, remote scripts, WebAssembly fetched at runtime, or a CDN.
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
The disclosed values are processed locally or stored through chrome.storage.sync for visual/interface preferences and chrome.storage.local for current site rules. BA Click FX has no developer-operated backend, analytics, telemetry, ads, or network requests. The developer cannot access the values.
```

## Store assets

Screenshot 1 is retained from the v1.0.2 submission because the visible effect runtime is unchanged. Screenshots 2–4 were regenerated from the final v1.0.6 build and show the simplified popup, current-site control, and full settings page. Use this refreshed set for a v1.0.5 or v1.0.6 Chromium update.

- Chrome Web Store icon: `icons/icon-128.png`
- Small promo: `store-assets/common/promo-small-440x280.png`
- Optional marquee: `store-assets/common/promo-marquee-1400x560.png`
- English screenshots: upload all four files from `store-assets/en/`
- Simplified Chinese screenshots: select the `zh_CN` listing locale and upload all four files from `store-assets/zh_CN/`

Screenshot order:

1. Click rings, particles, and cursor trail
2. Quick popup controls
3. Per-site enable/disable control
4. Full settings, appearance, and quality customization

## Distribution

- Visibility: `Public`
- Regions: all regions unless there is a specific legal or support reason to exclude one
- Pricing: free
- In-app purchases: none
- Mature content: no

## Next update template

For the next Chrome Web Store version:

1. Add a new entry under **Submitted release** with the version, core dependency, status, package name, and final SHA-256.
2. Record the category, visibility, verified website, homepage, support, and privacy fields exactly as submitted.
3. Replace the description code blocks with the final text actually saved in the dashboard; do not retain an earlier draft.
4. Keep terminology consistent: use “extension” / “扩展”, retain the unofficial disclaimer, and mention CDN only when answering the remote-code question.
5. Reconfirm permission justifications, remote-code status, disclosed data types, image paths, and reviewer notes against the submitted package.
6. Append the review result—approved, rejected, or changes requested—without altering the `v1.0.2` historical record.
