# BA Click FX Privacy Policy

Effective date: July 14, 2026

Last updated: July 21, 2026

BA Click FX is an unofficial, fan-made browser extension that renders configurable click effects and cursor trails on ordinary webpages. This policy explains the information the extension processes, how it is used, and the controls available to users.

## Information processed

BA Click FX processes only the information required to provide its visible effects and settings:

- Pointer coordinates and pointer events are processed temporarily in memory to draw click rings, particles, and cursor trails. They are not logged or retained.
- The current webpage origin is processed locally to determine whether the user has disabled the extension for that website.
- If the user explicitly disables a website, that website origin is saved as a site-specific preference.
- Visual preferences—including enabled states, color, opacity, scale, quality, render mode, maximum device-pixel ratio, effect-parameter overrides, language, and motion choices—are saved with the browser-provided `storage.sync` API.
- Site-specific disable rules are saved with the browser-provided `storage.local` API and remain on that browser profile.
- When upgrading from a version before 1.0.5, legacy site rules are copied from sync storage into local storage. The legacy synced copy is retained until the user explicitly removes it from the options page so another device that has not updated does not lose its rules.

The extension does not read webpage text, form values, passwords, cookies, personal communications, account information, or payment information.

## How information is used

The information above is used only to:

- render the user-requested visual effects;
- apply the user's selected appearance and performance settings; and
- remember whether the extension is enabled for a specific website.

BA Click FX does not use information for advertising, analytics, profiling, credit decisions, or any purpose unrelated to the extension's single purpose.

## Storage and transmission

BA Click FX has no developer-operated server and makes no network requests. The developer does not receive or have access to pointer data, browsing activity, or saved preferences.

The browser may synchronize saved visual preferences through the user's signed-in browser account when browser sync is enabled. That synchronization is performed by the browser vendor and is governed by the user's browser and account settings and the vendor's privacy policy. From version 1.0.5 onward, current site-specific rules use local extension storage and are not written to sync storage.

## Sharing and sale

The developer does not sell, rent, share, or transfer user information to third parties. The extension contains no advertising, analytics, telemetry, or remotely hosted code.

## Retention and user controls

Pointer coordinates exist only in memory while an effect is rendered. Saved preferences remain in browser extension storage until the user changes or resets them, clears extension data, disables browser sync, or uninstalls the extension. Users can remove a website rule by enabling the extension for that website, removing it from the options page, or clearing all local website rules. Visual reset and website-rule clearing are separate actions. A legacy synced website-rule copy can be deleted explicitly after the user's other devices have updated.

## Chrome Web Store Limited Use

The use of information received from browser APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Information is used only to provide or improve the extension's single, user-facing purpose.

## Children

BA Click FX is a general-purpose visual customization tool. It is not directed specifically to children and does not knowingly collect personal information from children.

## Changes

If the extension's data practices change, this policy and the store disclosures will be updated before the changed behavior is released. The effective date above will also be updated.

## Contact

Privacy or support questions can be submitted through the project's public issue tracker:

https://github.com/CialloKing/ba-click-fx-extension/issues

## 中文摘要

BA Click FX 只为实现可见的点击特效、光标拖尾与站点开关而在本地处理鼠标坐标和当前网页 origin。鼠标坐标只存在于内存中，不会记录或保留。颜色、不透明度、缩放、画质、渲染模式、最大设备像素比、圆环/碎片/Bloom/Hit/Flare/拖尾参数、开关、语言和动态偏好通过浏览器提供的 `storage.sync` API 保存；从 1.0.5 起，用户主动禁用的网站 origin 通过 `storage.local` 保存在当前浏览器配置中。

从 1.0.5 之前的版本升级时，旧同步站点规则会幂等复制到本机存储。为避免尚未升级的其他设备丢失规则，旧同步副本不会自动删除；用户确认其他设备完成升级后，可在完整设置页显式删除该副本。

扩展不会读取网页正文、表单、密码、Cookie、通信内容、账号或支付信息；没有开发者服务器，不包含广告、分析、遥测、远程代码或网络请求。开发者无法访问用户的鼠标数据、浏览活动或保存的设置，也不会出售、出租或向第三方共享这些信息。浏览器账号同步由浏览器厂商完成，并受用户的浏览器同步设置及厂商隐私政策约束。

用户可通过重新启用网站、在完整设置页移除或清空网站规则、恢复视觉默认值、清除扩展数据、关闭浏览器同步或卸载扩展来删除相应设置。
