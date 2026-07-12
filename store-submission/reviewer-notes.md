# Reviewer Notes

## English — submitted to Chrome Web Store

- Extension version: `1.0.2`
- Review package: `ba-click-fx-extension-v1.0.2-chromium.zip`
- No test account or credentials required

```text
BA Click FX adds configurable visual click effects and cursor trails to ordinary webpages.

Testing steps:
1. Install the extension.
2. Open https://example.com/ or another ordinary HTTP/HTTPS webpage. If the page was already open before the extension was installed, refresh it once.
3. Click the page to see a ring and particle effect.
4. Move the pointer to see the cursor trail.
5. Open the toolbar popup.
6. Change color, opacity, size, or quality and verify the page updates.
7. Turn off “Current website” and verify the Canvas overlay is removed for that origin.
8. Re-enable the website and use “Preview click effect”.

No account, login, credentials, payment, or external service is required.

The extension has no developer-operated server and performs no network requests. All executable code is bundled in the ZIP. Pointer coordinates are processed transiently in memory only to render effects. Visual preferences and origins explicitly disabled by the user are stored through the browser-provided sync storage API; the developer cannot access them.

Expected restrictions:
- browser internal pages and extension-store pages do not permit content scripts;
- file:// pages require the reviewer to enable file URL access; and
- the extension intentionally runs only in top-level documents, not inside every iframe.

Testing on file:// pages is optional and is not required to verify the extension's primary functionality.
```

## 简体中文——内部参考

```text
BA Click FX 为普通网页添加可配置的点击特效和鼠标光标拖尾。

测试步骤：
1. 安装扩展。
2. 打开 https://example.com/ 或其他普通 HTTP/HTTPS 网页。如果网页在安装扩展之前已经打开，请先刷新一次。
3. 点击网页，确认显示圆环和粒子。
4. 移动鼠标，确认显示拖尾。
5. 打开工具栏弹窗。
6. 修改颜色、不透明度、大小或画质，确认网页效果更新。
7. 关闭“当前网站”，确认该 origin 的 Canvas 覆盖层被移除。
8. 重新启用网站，并测试“预览点击特效”。

扩展不需要账号、登录、测试凭据、付费或外部服务。扩展没有开发者服务器，不会发起网络请求，所有可执行代码均包含在 ZIP 中。鼠标坐标只在内存中临时处理；视觉设置和用户主动禁用的网站 origin 通过浏览器提供的扩展存储保存，开发者无法访问。

无需使用 file:// 页面即可验证扩展的主要功能；本地文件页面测试属于可选步骤。
```

## Next update template

For each later submission:

1. Update the extension version and review-package filename before copying the English notes to the store dashboard.
2. Keep a deterministic ordinary-webpage test URL and retain the refresh instruction for pages opened before installation.
3. Confirm that no account, credentials, payment, backend, or mandatory file URL access has been introduced.
4. Recheck restricted pages, top-level document behavior, storage wording, and the exact controls available in that version.
5. Mark the English block with the store and submission status; keep the Chinese block as internal maintenance reference.
