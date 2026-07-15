# Firefox Add-ons Submission

## Prepared release

- Extension version: `1.0.6`
- Core dependency: `ba-click-fx 1.1.11`
- Manifest version: `3`
- Gecko ID: `ba-click-fx-extension@cialloking.top`
- Minimum Firefox Desktop version: `140.0`
- Minimum Firefox for Android version declared for manifest validation: `142.0`
- Submission platform: Firefox Desktop only
- Submission status: GitHub Release published; awaiting AMO submission
- GitHub Release: https://github.com/CialloKing/ba-click-fx-extension/releases/tag/v1.0.6
- Distribution: `On this site` / listed on AMO
- Remote code: `No`
- Data collection or transmission: `None`
- Firefox package: `ba-click-fx-extension-v1.0.6-firefox.zip`
- Firefox source package: `ba-click-fx-extension-v1.0.6-firefox-source.zip`
- Firefox SHA-256: `4F71DF6D22A7B03D57BC8742E505B59978856749547E6E606AE49E53C2B5BF63`
- Source SHA-256: `3B3E45366A8D5DBFC8CA30DE7C7135AEA56BD0318118B7B30EC34BD71178DE56`
- No test account, credentials, payment, hardware, or external service required

Do not upload the Chromium ZIP to AMO. The Firefox ZIP removes `minimum_chrome_version`, adds the stable Gecko identity, and declares the current built-in data collection permission.

## Listing configuration

- Name: `BA Click FX`
- Suggested AMO URL slug: `ba-click-fx`
- Category: `Appearance`
- Experimental: `No`
- Requires payment, non-free services, additional software, or hardware: `No`
- License: `MIT License`
- Homepage: https://ba-click-fx.cialloking.top/
- Support website: https://github.com/CialloKing/ba-click-fx-extension/issues
- Source code: https://github.com/CialloKing/ba-click-fx-extension
- Privacy policy: https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md

Use the Mozilla Account address as the support email if AMO requires a private contact address. Do not place a private email address in repository files.

## English summary

```text
Add configurable click rings, particles, and cursor trails to ordinary webpages.
```

## English description

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
1. Install the extension and open or refresh an ordinary HTTP/HTTPS webpage.
2. Click the webpage to display rings and particle fragments.
3. Move or drag the pointer to display the cursor trail.
4. Open the toolbar popup for quick controls, or select Full settings for all preferences and website rules.

Privacy and local processing:
• Pointer coordinates and click/move events are processed temporarily in memory only to draw visible effects
• The current website origin is processed locally for the per-site switch
• Website origins explicitly disabled by the user are saved in local extension storage
• Visual, interface, and motion preferences use browser-provided sync storage
• The developer does not receive browsing activity, pointer data, or saved preferences
• No ads, analytics, telemetry, profiling, page-content collection, or network requests

Known limitations:
• Browser internal pages, add-on stores, and some built-in viewers do not allow content scripts
• Effects are intentionally limited to top-level documents, so events inside some iframes are not displayed
• Local file pages require the user to grant local-file access in the add-on settings

BA Click FX is not affiliated with or endorsed by Nexon, NEXON Games, Yostar, or the Blue Archive project. No official game logos, characters, screenshots, or assets are included.
```

## 简体中文摘要

```text
为普通网页添加可配置的点击圆环、粒子碎片和鼠标光标拖尾。
```

## 简体中文说明

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
1. 安装扩展，然后打开或刷新普通 HTTP/HTTPS 网页。
2. 点击网页，显示圆环和粒子碎片。
3. 移动或拖动鼠标，显示光标拖尾。
4. 打开工具栏弹窗使用常用开关，或进入“完整设置”管理全部偏好和网站规则。

隐私与本地处理：
• 鼠标坐标和点击/移动事件只在内存中临时处理
• 当前网站 origin 只在本地用于站点开关
• 用户主动禁用的网站 origin 保存在本机扩展存储
• 视觉、界面和动态偏好使用浏览器提供的同步存储
• 开发者不会收到浏览活动、鼠标数据或保存的设置
• 不包含广告、分析、遥测、画像、网页内容收集或网络请求

已知限制：
• 浏览器内部页面、扩展商店和部分内置查看器禁止内容脚本运行
• 扩展只注入顶层文档，部分 iframe 内的鼠标事件不会显示特效
• 本地文件页面需要用户在附加组件设置中主动授予访问权限

BA Click FX 是非官方粉丝项目，与 Nexon、NEXON Games、Yostar 或《蔚蓝档案》官方不存在隶属、合作或认可关系。扩展不包含官方游戏 Logo、角色、截图或素材。
```

## Data collection declaration

Manifest value:

```json
"data_collection_permissions":
{
  "required": ["none"]
}
```

Select or confirm **No data collection or transmission** in AMO. Mozilla defines transmission as data handled outside the add-on or local browser. Pointer coordinates, click/move events, settings, and user-disabled origins remain inside the local browser. The extension has no developer-operated server and makes no network requests.

Do not copy Chrome Web Store's conservative `Web history` and `User activity` checkboxes into AMO. Those Chrome disclosures include local processing; AMO's manifest field describes collection or transmission outside the local add-on/browser boundary.

## Permission explanations

`storage`:

```text
Stores effect, appearance, quality, language, and motion preferences using Firefox-provided sync storage. Website origins explicitly disabled by the user are stored in local extension storage. Mozilla may synchronize sync-storage values when Firefox Sync is enabled. The developer has no server and cannot access any stored values.
```

`activeTab`:

```text
Used after the user opens the toolbar popup to identify the active website, show its current-site control, and send a user-requested preview message to that tab.
```

HTTP/HTTPS access:

```text
The extension's single purpose requires a content script on ordinary webpages so it can receive pointer events and draw a pointer-events:none Canvas overlay. It does not read or transmit page text, forms, cookies, credentials, or account data.
```

Local file access:

```text
Allows the same visual effects on local HTML files only after the user grants local-file access in Firefox add-on settings. File contents are not read or transmitted. This permission is not required to verify the primary functionality.
```

## Notes for Reviewers — submit in English

```text
BA Click FX adds configurable visual click effects and cursor trails to ordinary webpages.

Testing steps:
1. Install the extension.
2. Open https://example.com/ or another ordinary HTTP/HTTPS webpage. If the page was already open before installation, refresh it once.
3. Click the page to see a ring and particle effect.
4. Move the pointer to see the cursor trail.
5. Open the toolbar popup. Verify the global, current-website, click-effect, trail, and preview controls.
6. Select “Full settings”. Change the appearance preset, color, opacity, size, or quality and verify the webpage updates.
7. Select “Reduce continuous motion”. Verify click effects remain available while the always-moving trail is suppressed.
8. Turn off the current website in the popup. Verify the Canvas overlay is removed only for that origin and the origin appears under Disabled websites in Full settings.
9. Re-enable or remove that website rule and use “Preview click effect”.

No account, login, credentials, payment, hardware, or external service is required.

The extension has no developer-operated server and performs no network requests. All executable code, including ba-click-fx, is bundled in the ZIP. Pointer coordinates are processed transiently in memory only to render visible effects. Visual, interface, and motion preferences use Firefox-provided sync storage. Website origins explicitly disabled by the user use local extension storage. The developer cannot access any of these values.

The submitted source archive contains the exact package lock and SOURCE_BUILD.md. Use Node.js 24, run npm ci, then npm run package:firefox to reproduce the submitted Firefox ZIP.

Expected restrictions:
- about: pages, addons.mozilla.org, and built-in viewers do not permit content scripts;
- local file pages require optional local-file access; and
- the extension intentionally runs only in top-level documents, not inside every iframe.

Testing on file:// pages is optional and is not required to verify the extension's primary functionality.
```

## Manual submission checklist

1. Complete the Firefox runtime checklist before tagging `v1.0.6`.
2. Confirm the GitHub Release contains both Firefox archives and `SHA256SUMS.txt`.
3. Log in to https://addons.mozilla.org/developers/ with a Mozilla Account.
4. Choose **Submit a New Add-on** and **On this site**.
5. Upload `ba-click-fx-extension-v1.0.6-firefox.zip`.
6. Stop and fix the package if AMO reports an error or a security/privacy warning.
7. Select Firefox Desktop as the compatible platform.
8. Answer **Yes** to the source-code question and upload `ba-click-fx-extension-v1.0.6-firefox-source.zip`.
9. Fill the listing fields from this document and add English and Simplified Chinese localizations.
10. Upload the 128×128 icon and the refreshed v1.0.6 localized 1280×800 screenshots.
11. Paste the English reviewer notes and submit the version.
12. Record the AMO item URL, submission time, status, and final dashboard text after submission.

Do not replace a submitted `v1.0.6` archive. Listing-only corrections may be made in AMO; code or package corrections require a new extension version.
