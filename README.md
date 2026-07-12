# BA Click FX Extension

把 [ba-click-fx](https://github.com/CialloKing/ba-click-fx) 封装为 Manifest V3 浏览器插件。安装后，普通网页会立即获得蔚蓝档案风格的点击圆环、粒子碎片和鼠标光标拖尾。

## 功能

- 安装后默认开启，无需给每个网站添加脚本。
- 点击特效与光标拖尾可分别开关。
- 可按网站持久禁用，不影响其他页面。
- 可调整主题颜色、透明度、特效大小和画质。
- 设置通过浏览器同步存储保存。
- 默认使用简体中文；检测到非中文浏览器语言时自动使用英文，检测失败时回退中文。
- 弹窗提供项目仓库入口，方便查看源码、版本和提交问题。
- 纯本地 Canvas 2D 渲染，不请求远程脚本、图片或接口。
- Canvas 位于 closed Shadow DOM 内，不占据页面布局，也不会拦截鼠标事件。

## 本地安装

### 使用构建产物

1. 下载项目并进入目录。
2. 执行 `npm install`。
3. 执行 `npm run build`。
4. 在 Chrome 中打开 `chrome://extensions/`，或在 Edge 中打开 `edge://extensions/`。
5. 开启“开发者模式”，选择“加载已解压的扩展程序”，加载项目下的 `dist` 目录。
6. 刷新已经打开的普通网页。

浏览器内部页面、扩展商店和部分内置 PDF 页面禁止内容脚本注入，这是浏览器的安全限制。若要在 `file://` 页面使用，还需在扩展详情页开启“允许访问文件网址”。

当前构建面向 Chrome/Edge 102 或更高版本。为避免在广告等多 iframe 页面重复创建 Canvas，插件只注入顶层文档；嵌入式视频、编辑器或地图的 iframe 内部不会显示特效。后台标签页会释放 Canvas，再次切回时自动恢复；高画质还会按屏幕面积限制实际 DPR，避免 2K/4K 屏幕产生过高显存占用。

## 开发

环境要求：Node.js 18 或更高版本。

```powershell
npm install
npm test
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 将内容脚本、弹窗和静态资源构建到 `dist` |
| `npm test` | 构建并执行单元测试、Manifest 校验和编码校验 |
| `npm run check:store` | 检查版本、商店文案、链接和全部图片尺寸 |
| `npm run package` | 构建并生成 Manifest 位于 ZIP 根目录的 Chromium 提交包 |
| `npm run check:encoding` | 检查所有文本文件是否为有效 UTF-8 BOM |
| `npm run format:encoding` | 为缺少 BOM 的文本文件补充 BOM |

## Chrome Web Store 与 Edge Add-ons 上架材料

仓库已经包含 Chrome/Edge 首次上架所需的可复用材料：

| 目录或文件 | 内容 |
| --- | --- |
| [`store-submission/`](./store-submission/) | 中英文商店文案、隐私表单答案、权限理由、审核员测试步骤和发布清单 |
| [`store-assets/`](./store-assets/) | 300×300 图标、440×280 小宣传图、1400×560 横幅，以及中英文各 4 张 1280×800 截图 |
| [`PRIVACY.md`](./PRIVACY.md) | 中英文隐私政策源码 |
| [`store-submission/LOCAL_TEST_CHECKLIST.md`](./store-submission/LOCAL_TEST_CHECKLIST.md) | Chrome/Edge 手工加载与回归检查步骤 |

执行以下命令即可生成待上传的 Chromium ZIP：

```powershell
npm ci
npm test
npm run package
```

输出文件为 `release/ba-click-fx-extension-v1.0.2-chromium.zip`。Chrome 和 Edge 可复用同一份 ZIP；ZIP 根目录直接包含 `manifest.json`，不能把 `dist` 目录本身再包一层。

商店图片由 `store-assets/source/` 中的本地展示页运行当前 `dist/content.js` 与 `dist/popup/popup.js` 后生成。它们使用项目自有图标和界面，不包含官方游戏素材，并明确标注为非官方粉丝插件。

隐私披露采用保守口径：扩展只在本地处理指针事件和当前网站 origin，并使用 `storage.sync` 保存视觉设置及用户明确禁用的网站 origin；不读取网页正文、表单、密码、Cookie，不上传数据，也不含遥测、广告或远程代码。详细勾选项和填写文本见 [`store-submission/chrome-web-store.md`](./store-submission/chrome-web-store.md) 与 [`store-submission/edge-addons.md`](./store-submission/edge-addons.md)。

项目主页使用独立演示站 `https://ba-click-fx.cialloking.top/`，隐私政策和支持入口使用公开 GitHub 仓库，不启用 GitHub Pages。随后按照 [`store-submission/release-checklist.md`](./store-submission/release-checklist.md) 完成浏览器实机回归、商店账号填写和人工提交。Firefox 的 Manifest 与商店要求单独记录在 [`store-submission/firefox-follow-up.md`](./store-submission/firefox-follow-up.md)，不混入当前 Chromium 包。

## 核心依赖与更新

项目通过 npm 依赖 `ba-click-fx`，不在仓库内维护核心源码副本。esbuild 会在构建阶段把依赖打进 `dist/content.js`，因此发布后的插件不依赖 npm、CDN 或网络运行。

`package.json` 与 `package-lock.json` 固定实际构建版本，保证依赖私有状态的适配代码不会被静默升级破坏；`.github/dependabot.yml` 每周检查 npm 新版本并创建带测试的升级 PR。也可以手动更新：

```powershell
npm install --save-exact ba-click-fx@latest
npm test
```

## 项目结构

```text
assets/                 图标的 SVG 设计源文件
_locales/               Manifest 与弹窗的中英文文案
icons/                  Manifest 使用的 PNG 图标
release/                npm run package 生成的商店 ZIP（不提交）
scripts/                构建、Manifest 与 UTF-8 BOM 校验脚本
src/content.js          网页内容脚本与核心引擎适配层
src/popup/              插件弹窗
src/shared/settings.js  两端共用的设置模型
store-assets/           商店图片及其可复现的本地展示源
store-submission/       商店文案、表单答案和发布检查清单
test/                   核心包和设置单元测试
dist/                   可直接加载的插件构建产物
manifest.json           Manifest V3 源清单
```

## 权限与隐私

- `storage`：保存并同步用户设置及用户明确禁用的网站 origin。
- `activeTab`：弹窗打开时识别当前网站，并在当前标签页触发一次预览。
- `http://*/*`、`https://*/*`、`file:///*` 内容脚本匹配：让特效安装后可在网页中自动运行。

插件只在本地短暂处理鼠标坐标和当前网站 origin，不读取、上传或分析网页正文、表单、密码或 Cookie，也不包含遥测和网络请求。浏览器仍会针对全站内容脚本显示相应的访问权限提示。完整政策见 [`PRIVACY.md`](./PRIVACY.md)。

## 编码

仓库内所有文本文件和构建出的文本资源统一使用 UTF-8 with BOM 与 LF 换行。PNG、ZIP 等二进制文件不具有文本编码，编码检查会按文件类型排除它们。

## 许可证

本项目采用 [MIT License](./LICENSE)。特效核心的许可证及来源见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
