# Reviewer Notes

## English — prepared for the v1.0.5 update

- Extension version: `1.0.5`
- Review package: `ba-click-fx-extension-v1.0.5-chromium.zip`
- Core dependency: `ba-click-fx 1.1.11`
- No test account or credentials required

```text
BA Click FX adds configurable visual click effects and cursor trails to ordinary webpages.

Testing steps:
1. Install or update the extension.
2. Open https://example.com/ or another ordinary HTTP/HTTPS webpage. If the page was already open before the extension was installed or updated, refresh it once.
3. Click the page to see a ring and particle effect.
4. Move the pointer to see the cursor trail.
5. Open the toolbar popup. Verify the global, current-website, click-effect, trail, and preview controls.
6. Select “Full settings”. Change the appearance preset, color, opacity, size, or quality and verify the webpage updates.
7. In Full settings, select “Reduce continuous motion”. Verify click effects remain available while the always-moving trail is suppressed.
8. Turn off the current website in the popup. Verify the Canvas overlay is removed only for that origin and the origin appears under Disabled websites in Full settings.
9. Re-enable or remove that website rule and use “Preview click effect”.

No account, login, credentials, payment, or external service is required.

The extension has no developer-operated server and performs no network requests. All executable code, including ba-click-fx, is bundled in the ZIP. Pointer coordinates are processed transiently in memory only to render visible effects. Visual, interface, and motion preferences use browser-provided sync storage. Website origins explicitly disabled by the user use local extension storage. The developer cannot access any of these values.

Upgrade behavior:
- Existing pre-1.0.5 synced website rules are copied into local storage idempotently.
- The legacy synced copy is retained to protect other devices that have not updated.
- A user may explicitly delete only that legacy copy from Full settings after other devices update; migrated local rules remain available.

Expected restrictions:
- browser internal pages and extension-store pages do not permit content scripts;
- file:// pages require the reviewer to enable file URL access; and
- the extension intentionally runs only in top-level documents, not inside every iframe.

Testing on file:// pages is optional and is not required to verify the extension's primary functionality.
```

## 简体中文——v1.0.5 内部参考

```text
BA Click FX 为普通网页添加可配置的点击特效和鼠标光标拖尾。

测试步骤：
1. 安装或更新扩展。
2. 打开 https://example.com/ 或其他普通 HTTP/HTTPS 网页。如果网页在安装或更新扩展之前已经打开，请先刷新一次。
3. 点击网页，确认显示圆环和粒子。
4. 移动鼠标，确认显示拖尾。
5. 打开工具栏弹窗，验证全局、当前网站、点击、拖尾和预览控件。
6. 打开“完整设置”，修改预设、颜色、不透明度、大小或画质，确认网页效果更新。
7. 选择“减少持续动态”，确认点击特效仍可使用，但不再持续显示移动拖尾。
8. 在弹窗中关闭当前网站，确认 Canvas 只从该 origin 移除，并且该 origin 出现在完整设置的已禁用网站列表中。
9. 重新启用或移除该网站规则，并测试“预览点击特效”。

扩展不需要账号、登录、测试凭据、付费或外部服务。扩展没有开发者服务器，不会发起网络请求，所有可执行代码均包含在 ZIP 中。鼠标坐标只在内存中临时处理；视觉、界面和动态偏好使用浏览器同步存储，用户主动禁用的网站 origin 使用本机扩展存储，开发者无法访问。

无需使用 file:// 页面即可验证扩展的主要功能；本地文件页面测试属于可选步骤。
```

## Historical Chrome submission — v1.0.2

- Submission status: Submitted for review
- Review package: `ba-click-fx-extension-v1.0.2-chromium.zip`
- No test account or credentials required

The exact v1.0.2 product copy, package SHA-256, and submitted storage wording remain recorded in [chrome-web-store.md](./chrome-web-store.md). Do not rewrite that historical record when submitting v1.0.5.

## Next update template

For each later submission:

1. Update the extension version, core dependency, and review-package filename before copying the English notes to the store dashboard.
2. Keep a deterministic ordinary-webpage test URL and retain the refresh instruction for pages opened before installation or update.
3. Confirm that no account, credentials, payment, backend, or mandatory file URL access has been introduced.
4. Recheck restricted pages, top-level document behavior, storage wording, migration behavior, and the exact controls available in that version.
5. Mark the English block with the store and submission status; keep the Chinese block as internal maintenance reference.
