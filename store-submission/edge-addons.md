# Microsoft Edge Add-ons Submission

## Package and URLs

- Package: `release/ba-click-fx-extension-v1.0.5-chromium.zip`
- Core dependency: `ba-click-fx 1.1.11`
- Submission status: Prepared; not yet uploaded
- Website: https://ba-click-fx.cialloking.top/
- Microsoft Edge privacy policy: https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md
- Support: https://github.com/CialloKing/ba-click-fx-extension/issues
- Suggested category: `Personalization` or the closest current category available in Partner Center
- Visibility: `Public`
- Markets: all markets
- Mature content: no

## English listing (`en-US`)

### Name

```text
BA Click FX
```

### Short description

The short description is localized from the Manifest:

```text
Add game-inspired click rings, particles, and cursor trails to ordinary websites.
```

### Description

```text
BA Click FX is an unofficial, fan-made visual-effects extension for Microsoft Edge. It adds game-inspired click rings, particle fragments, and a theme-colored cursor light trail to ordinary webpages. All effects are rendered locally with Canvas 2D.

Use the toolbar popup for quick effect and current-website controls. The full settings page provides appearance presets, color, opacity, size, quality, language, reduced-motion preferences, and searchable local website-rule management. The extension releases Canvas resources while tabs are in the background and works offline without a developer server.

Pointer coordinates are processed temporarily in memory only to draw visible effects. The current website origin is processed locally for the site switch, and an origin is saved only when the user explicitly disables that website. Visual, interface, and motion preferences use Microsoft Edge browser sync storage; current website rules use local extension storage. The developer cannot access pointer data, browsing activity, or saved preferences.

There are no ads, analytics, telemetry, profiling, remote code, or network requests. Browser internal pages, add-on stores, and some built-in viewers do not allow content scripts. Events inside some iframes are intentionally outside the extension's top-level scope.

BA Click FX is not affiliated with or endorsed by Nexon, NEXON Games, Yostar, or the Blue Archive project. No official game logos, characters, screenshots, or assets are included.
```

### Search terms

```text
click effects, cursor trail, mouse effects, particles, page customization, visual feedback
```

## 简体中文列表 (`zh-CN`)

### 名称

```text
BA Click FX
```

### 短描述

```text
为普通网页添加游戏风格的点击圆环、粒子碎片和鼠标光标拖尾。
```

### 描述

```text
BA Click FX 是一个适用于 Microsoft Edge 的非官方网页视觉特效扩展。它会为普通网页添加游戏风格的点击圆环、粒子碎片和主题色鼠标光标拖尾，所有效果均使用 Canvas 2D 在本地渲染。

用户可以通过工具栏弹窗快速控制点击特效、拖尾和当前网站。完整设置页提供外观预设、颜色、不透明度、大小、画质、语言、减少动态偏好和可搜索的本机网站规则管理。标签页进入后台时会释放 Canvas 资源；扩展无需开发者服务器，离线也能使用。

鼠标坐标只在内存中临时处理，用于绘制用户可见的特效。当前网站 origin 只在本地用于站点开关，只有当用户主动关闭某个网站时才会保存。视觉、界面和动态偏好使用 Microsoft Edge 浏览器同步存储，当前网站规则使用本机扩展存储；开发者无法访问鼠标数据、浏览活动或保存的设置。

扩展不包含广告、分析、遥测、画像、远程代码或网络请求。浏览器内部页面、扩展商店和部分内置查看器禁止内容脚本运行；部分 iframe 内的事件不在扩展的顶层文档作用范围内。

BA Click FX 是非官方粉丝项目，与 Nexon、NEXON Games、Yostar 或《蔚蓝档案》官方不存在隶属、合作或认可关系。扩展不包含官方游戏 Logo、角色、截图或素材。
```

### 搜索词

```text
点击特效, 光标拖尾, 鼠标特效, 粒子, 网页美化, 视觉反馈
```

## Partner Center Privacy page

### Single Purpose Description

```text
Display configurable pointer click animations and cursor trails on ordinary webpages in Microsoft Edge.
```

### Permission justification

`storage`:

```text
Stores visual, interface, and motion preferences using Microsoft Edge browser sync storage. Website origins that the user explicitly disables are stored in local extension storage. During the v1.0.5 upgrade, legacy synced origins are copied to local storage and retained until the user explicitly removes the old synced copy. The developer cannot access these values.
```

`activeTab`:

```text
Used when the user opens the popup to identify the active website, display its hostname, apply the current-site control, and trigger a user-requested preview.
```

`http://*/*`, `https://*/*`:

```text
Required for the content script to receive pointer events and draw a non-interactive Canvas overlay on ordinary webpages. Page text, forms, cookies, credentials, and account data are not read or transmitted.
```

`file:///*`:

```text
Allows effects on local HTML files only after the user explicitly enables file URL access. File contents are not read or transmitted.
```

### Are you using remote code?

Select:

```text
No, I am not using remote code.
```

### Data usage

Conservatively disclose the same two locally handled categories as Chrome:

- Web browsing activity: current origin and user-disabled origins, used only for the site switch.
- User activity: pointer coordinates and click/move events, processed only in memory to draw effects.

State that no data reaches the developer, no information is sold or shared, and no analytics, ads, telemetry, profiling, or server exists.

## Store assets

For each language, upload or duplicate:

- Logo: `store-assets/common/logo-300.png`
- Small promotional tile: `store-assets/common/promo-small-440x280.png`
- Large promotional tile: `store-assets/common/promo-marquee-1400x560.png`
- Up to four locale-specific screenshots from `store-assets/en/` or `store-assets/zh_CN/`

## Notes for certification

Use the complete English text from [reviewer-notes.md](./reviewer-notes.md). No account, credentials, backend, or test data are required.
