# Reviewer Notes

## English

```text
BA Click FX adds configurable visual click effects and cursor trails to ordinary webpages.

Testing steps:
1. Install the extension.
2. Open or refresh any ordinary HTTP or HTTPS webpage.
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
```

## 简体中文

```text
BA Click FX 为普通网页添加可配置的点击特效和鼠标光标拖尾。

测试步骤：
1. 安装插件。
2. 打开或刷新任意普通 HTTP/HTTPS 网页。
3. 点击网页，确认显示圆环和粒子。
4. 移动鼠标，确认显示拖尾。
5. 打开工具栏弹窗。
6. 修改颜色、不透明度、大小或画质，确认网页效果更新。
7. 关闭“当前网站”，确认该 origin 的 Canvas 覆盖层被移除。
8. 重新启用网站，并测试“预览点击特效”。

插件不需要账号、登录、测试凭据、付费或外部服务。插件没有开发者服务器，不会发起网络请求，所有可执行代码均包含在 ZIP 中。鼠标坐标只在内存中临时处理；视觉设置和用户主动禁用的网站 origin 通过浏览器同步存储保存，开发者无法访问。
```
