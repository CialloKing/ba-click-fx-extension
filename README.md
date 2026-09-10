# BA Click FX Extension

把 [ba-click-fx](https://github.com/CialloKing/ba-click-fx) 封装为 Manifest V3 浏览器扩展。安装后，普通网页会立即获得蔚蓝档案风格的点击圆环、粒子碎片和鼠标光标拖尾。本项目主要通过 AI 生成和迭代完成（**绝无手写代码**）。

## 功能

- 安装后默认开启，无需给每个网站添加脚本。
- 默认使用网页透明覆盖层与 Screen 组成的 DOM Add（近似）合成，适应扩展无法预先采样的任意网页背景；完整设置仍保留 Scene、Source-over 和 Plus-lighter 供显式选择。
- 点击特效与光标拖尾可分别开关。
- 可按网站持久禁用，不影响其他页面。
- 工具栏弹窗与完整设置页共用同一组效果预设：贴近原版、浅色背景优化、柔和和省电。预设会原子设置外观、渲染模式、DPR 与合成方式；完整设置仍可精确选择 WebGPU HDR、完整 WebGL2、兼容渲染模式和 DPR，手动调整后显示为自定义。弹窗也可切换界面语言。
- 独立设置页从上游参数 Schema 生成完整的 66 项特效面板，可管理主题颜色、透明度、缩放、实验性 WebGPU HDR、完整 WebGL2 与兼容渲染模式、DPR、输出合成、浅色背景对比、点击/轨迹时间倍率，以及语言、动态偏好和网站规则。WebGPU HDR 的六项展示校准仅作用于 Extended 输出，不改写 Unity 特效参数；只有运行时 `resolvedWebGPUOutputMode === 'extended'` 才表示浏览器侧 HDR 已就绪。
- 视觉偏好通过浏览器提供的同步存储保存；站点禁用规则仅保存在本机扩展存储。
- 默认跟随系统语言：中文环境使用简体中文，非中文环境使用英文，检测失败回退中文；也可手动指定。
- 支持跟随系统的“减少动态效果”偏好，并允许手动选择完整或减少持续动态。
- 弹窗提供项目仓库入口，方便查看源码、版本和提交问题。
- 纯本地 Canvas 2D / WebGL2 / WebGPU 渲染，不请求远程脚本、图片或接口。
- Canvas 位于 closed Shadow DOM 内，不占据页面布局，也不会拦截鼠标事件。

## 本地安装

### Chromium 使用构建产物

1. 下载项目并进入目录。
2. 执行 `npm install`。
3. 执行 `npm run build`。
4. 在 Chrome 中打开 `chrome://extensions/`，或在 Edge 中打开 `edge://extensions/`。
5. 开启“开发者模式”，选择“加载已解压的扩展程序”，加载项目下的 `dist` 目录。
6. 刷新已经打开的普通网页。

浏览器内部页面、扩展商店和部分内置 PDF 页面禁止内容脚本注入，这是浏览器的安全限制。若要在 `file://` 页面使用，还需在扩展详情页开启“允许访问文件网址”。

当前构建面向 Chrome/Edge 102 或更高版本。为避免在广告等多 iframe 页面重复创建 Canvas，扩展只注入顶层文档；嵌入式视频、编辑器或地图的 iframe 内部不会显示特效。后台标签页会释放 Canvas，再次切回时自动恢复；不同效果预设会统一选择外观、渲染管线、设备像素比上限与网页合成合同，在效果、亮底适配和资源占用之间取舍。

### 内置效果预设与核心 API 参数

工具栏弹窗和完整设置页通过 `getAppearancePresetPatch()` 使用同一份原子补丁，再由内容脚本传给 `BAClickFX` 的构造函数或 `updateConfig()`。下面所说的“默认值”是扩展 `DEFAULT_SYNC_SETTINGS` 的默认值，不是上游库裸实例的默认值；这里只列出预设相对扩展默认值实际改变的参数。

所有预设补丁都先以以下扩展默认合成基线为起点；浅色背景优化会按下表覆盖其中的四个字段：

```js
{
  outputCompositing: 'browser-overlay',
  overlayAlphaPolicy: 'coverage',
  overlayColorCompensation: 'none',
  overlayAlphaLimit: 250 / 255,
  hostCompositing: 'screen',
  isolatedCompositing: false,
  lightBackgroundContrastAlpha: 0,
}
```

扩展设置中的 `color` 会映射为核心 API 的 `themeColor`；`renderMode: 'full-webgl2'` 会展开为 `effectBackend: 'webgl2'` 和 `bloomBackend: 'webgl2'`。

贴近原版和浅色背景优化还共同使用 `themeColor: '#4ca7ff'`、`opacity: 1`、`scale: 1`、`effectBackend: 'webgl2'`、`bloomBackend: 'webgl2'` 和 `maxDpr: 2`；柔和与省电预设对这些外观或渲染字段的覆盖见下表。

| 预设 | 内部 ID | 相对扩展默认值的 API 覆盖 | 作用 |
| --- | --- | --- | --- |
| 贴近原版 | `classic` | 无；直接使用扩展默认合成合同：`overlayAlphaPolicy: 'coverage'`、`overlayColorCompensation: 'none'`、`overlayAlphaLimit: 250 / 255`、`hostCompositing: 'screen'` | 使用网页透明覆盖层，并由外层宿主以 `screen`（界面显示为“DOM Add（近似）”）进行亮度近似。 |
| 浅色背景优化 | `light-background` | `overlayAlphaPolicy: 'visual-max'`；`overlayColorCompensation: 'bright-core'`；`overlayAlphaLimit: 0.85`；`hostCompositing: 'source-over'` | 使用普通 `source-over` 覆盖，提升高能核心在浅色网页上的可见度，同时限制覆盖层 Alpha，减少对网页背景的遮挡。 |
| 柔和 | `soft` | `themeColor: '#8edcff'`；`opacity: 0.35`；`scale: 0.9`；`effectBackend: 'canvas2d'`；`bloomBackend: 'native'`；`maxDpr: 1` | 降低整体强度和分辨率，使用 Canvas 2D 与原生辉光以减少视觉刺激和资源占用。 |
| 省电 | `performance` | `opacity: 0.45`；`effectBackend: 'canvas2d'`；`bloomBackend: 'native'`；`maxDpr: 1` | 保持默认主题色和尺寸，降低透明度并切换到较轻量的渲染路径。 |

在 `hostCompositing: 'screen'` 或 `'plus-lighter'` 下，核心会忽略覆盖层 Alpha 策略、颜色补偿和 Alpha 上限；因此“贴近原版”表中的这三个 Alpha 相关字段主要是保留的默认合同，而不是当前 `screen` 合成的主动调节项。“浅色背景优化”使用 `source-over`，这四个覆盖项才会实际参与输出。四种预设都保持 `isolatedCompositing: false` 和 `lightBackgroundContrastAlpha: 0`，不会额外创建隔离透明组或淡青色对比轮廓。

适配层还固定传入 `inputSource: 'dom'` 和 `hostCompositingSurface: 'native'`；`preset` 只是扩展的状态标记，不是 `BAClickFX` 的核心参数。预设切换也不会重写 `fxParams`、点击/拖尾开关、时间倍率、HDR 展示参数、语言或动态偏好。

### Firefox 临时安装

1. 执行 `npm run build:firefox`。
2. 在 Firefox 140 或更高版本中打开 `about:debugging#/runtime/this-firefox`。
3. 点击“临时载入附加组件”，选择 `dist-firefox/manifest.json`。
4. 打开或刷新普通 HTTP/HTTPS 网页。

Firefox 构建使用固定 Gecko ID `ba-click-fx-extension@cialloking.top`，并按 AMO 要求明确声明不收集或传输数据。正式版必须经过 Mozilla 签名；`about:debugging` 仅用于开发和发布前验证。

## 开发

环境要求：Node.js 24 或更高版本。

```powershell
npm install
npm test
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 将 Chromium 内容脚本、弹窗和静态资源构建到 `dist` |
| `npm run build:firefox` | 将 Firefox 目标构建到 `dist-firefox` |
| `npm run build:all` | 构建 Chromium 与 Firefox 两个目标 |
| `npm test` | 构建双目标并执行单元测试、Manifest、商店资源和编码校验 |
| `npm run test:star-history` | 单独校验 Star 历史采集、CSV 存储和 SVG 生成 |
| `npm run lint:firefox` | 使用 `web-ext` 校验 Firefox 包且将警告视为错误 |
| `npm run check:release -- v1.1.15` | 打包后校验标签、版本、三个 ZIP 和全部哈希 |
| `npm run check:store` | 检查版本、商店文案、链接和全部图片尺寸 |
| `npm run package` | 构建并生成 Manifest 位于 ZIP 根目录的 Chromium 提交包 |
| `npm run package:firefox` | 构建、lint 并生成 Firefox 提交包 |
| `npm run package:all` | 生成双浏览器包、Firefox 源码包和 SHA-256 清单 |
| `npm run check:encoding` | 检查所有文本文件是否为有效 UTF-8 BOM |
| `npm run format:encoding` | 为缺少 BOM 的文本文件补充 BOM |

## 浏览器商店上架材料

仓库已经包含 Chrome/Edge 首次上架所需的可复用材料：

| 目录或文件 | 内容 |
| --- | --- |
| [`store-submission/`](./store-submission/) | 中英文商店文案、隐私表单答案、权限理由、审核员测试步骤和发布清单 |
| [`store-assets/`](./store-assets/) | 300×300 图标、440×280 小宣传图、1400×560 横幅，以及中英文各 4 张 1280×800 截图 |
| [`PRIVACY.md`](./PRIVACY.md) | 中英文隐私政策源码 |
| [`store-submission/LOCAL_TEST_CHECKLIST.md`](./store-submission/LOCAL_TEST_CHECKLIST.md) | Chrome/Edge 手工加载与回归检查步骤 |
| [`store-submission/FIREFOX_TEST_CHECKLIST.md`](./store-submission/FIREFOX_TEST_CHECKLIST.md) | Firefox 临时加载与发布前实机检查步骤 |
| [`store-submission/firefox-addons.md`](./store-submission/firefox-addons.md) | AMO 商品文案、隐私答案、审核说明和人工提交步骤 |

执行以下命令即可生成全部候选包：

```powershell
npm ci
npm test
npm run package:all
```

输出文件包括：

```text
release/ba-click-fx-extension-v1.1.15-chromium.zip
release/ba-click-fx-extension-v1.1.15-firefox.zip
release/ba-click-fx-extension-v1.1.15-firefox-source.zip
release/SHA256SUMS.txt
```

Chrome 和 Edge 可复用 Chromium ZIP；Firefox 必须使用独立 Firefox ZIP。两个浏览器 ZIP 的根目录均直接包含 `manifest.json`，不能把构建目录本身再包一层。

商店图片由 `store-assets/source/` 中的本地展示页运行当前 `dist/content.js`、`dist/popup/popup.js` 与 `dist/options/options.js` 后生成。它们使用项目自有图标和界面，不包含官方游戏素材，并明确标注为非官方粉丝扩展。

隐私披露采用保守口径：扩展只在本地处理指针事件和当前网站 origin；视觉设置使用 `storage.sync`，用户明确禁用的网站 origin 使用 `storage.local`。扩展不读取网页正文、表单、密码或 Cookie，不上传数据，也不含遥测、广告或远程代码。详细勾选项和填写文本见 [`store-submission/chrome-web-store.md`](./store-submission/chrome-web-store.md) 与 [`store-submission/edge-addons.md`](./store-submission/edge-addons.md)。

项目主页使用独立演示站 `https://ba-click-fx.cialloking.top/`，隐私政策和支持入口使用公开 GitHub 仓库，不启用 GitHub Pages。按照 [`store-submission/release-checklist.md`](./store-submission/release-checklist.md) 完成浏览器实机回归和发布；Firefox 的实际 AMO 文案、源码说明和人工步骤见 [`store-submission/firefox-addons.md`](./store-submission/firefox-addons.md)。

## 核心依赖与更新

项目通过 npm 精确依赖 `ba-click-fx 1.3.2`，不在仓库内维护核心源码副本。esbuild 会在构建阶段把依赖打进 `dist/content.js`，因此发布后的插件不依赖 npm、CDN 或网络运行。

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
manifests/              Chromium 与 Firefox 的目标专用 Manifest 覆盖
src/content.js          网页内容脚本与核心引擎适配层
src/popup/              扩展弹窗
src/options/            完整设置页
src/shared/             共用设置、存储迁移和本地化模块
store-assets/           商店图片及其可复现的本地展示源
store-submission/       商店文案、表单答案和发布检查清单
test/                   核心包和设置单元测试
dist/                   构建生成、可直接加载且不纳入 Git 的扩展产物
dist-firefox/           Firefox 构建产物（不纳入 Git）
manifest.json           两个浏览器共用的 Manifest V3 基础清单
```

## 权限与隐私

- `storage`：在同步存储中保存视觉偏好，并在本机存储中保存用户明确禁用的网站 origin。
- `activeTab`：弹窗打开时识别当前网站，并在当前标签页触发一次预览。
- `http://*/*`、`https://*/*`、`file:///*` 内容脚本匹配：让特效安装后可在网页中自动运行。

扩展只在本地短暂处理鼠标坐标和当前网站 origin，不读取、上传或分析网页正文、表单、密码或 Cookie，也不包含遥测和网络请求。浏览器仍会针对全站内容脚本显示相应的访问权限提示。完整政策见 [`PRIVACY.md`](./PRIVACY.md)。

## 编码

仓库内所有文本文件和构建出的文本资源统一使用 UTF-8 with BOM 与 LF 换行。PNG、ZIP 等二进制文件不具有文本编码，编码检查会按文件类型排除它们。

## Star 历史

本仓库在独立的 `star-history` 分支维护 Star 数量历史，并由 GitHub Actions 每天更新一次（计划于北京时间 03:17 执行）。

<p align="center">
  <a href="https://github.com/CialloKing/ba-click-fx-extension/blob/star-history/stars.csv">
    <img src="https://raw.githubusercontent.com/CialloKing/ba-click-fx-extension/refs/heads/star-history/star-history.svg" alt="ba-click-fx-extension Star 数量历史图" width="960">
  </a>
</p>

[查看 CSV 原始数据](https://github.com/CialloKing/ba-click-fx-extension/blob/star-history/stars.csv)。首次回溯根据当前 Star 用户的时间记录生成，无法恢复已取消的 Star；CSV 通过 `reconstructed` 和 `observed` 区分回溯重建与每日实测。漏跑日期保持缺失，不使用插值或伪造快照补齐。

## 许可证

本项目采用 [MIT License](./LICENSE)。特效核心的许可证及来源见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
