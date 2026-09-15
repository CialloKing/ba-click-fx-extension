# 开发与发布指南

[返回 README](../README.md)

## 环境与构建

需要 Node.js 24 或更高版本及其附带的 npm。在下载或克隆后的项目根目录执行：

```sh
npm ci
npm test
```

`npm ci` 使用锁文件安装依赖；`npm test` 构建 Chromium 和 Firefox 两个目标，再执行单元测试、Manifest、商店资源及编码检查。浏览器中的加载方法见 [README](../README.md#安装)。

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 构建 Chromium 到 `dist` |
| `npm run build:firefox` | 构建 Firefox 到 `dist-firefox` |
| `npm run build:all` | 构建两个目标 |
| `npm test` | 构建双目标并执行自动检查 |
| `npm run test:star-history` | 单独验证 Star 历史采集、CSV 与 SVG 生成 |
| `npm run lint:firefox` | 使用 `web-ext` 校验 Firefox 构建，警告视为错误 |
| `npm run check:store` | 校验商店元数据、必要文件、URL 格式与图片尺寸 |
| `npm run package` | 构建并打包 Chromium |
| `npm run package:firefox` | 构建、lint 并打包 Firefox |
| `npm run package:all` | 生成双浏览器包、Firefox 源码包和 SHA-256 清单 |
| `npm run check:release -- <tag>` | 打包后校验目标标签、版本、三个 ZIP 与已记录的哈希；将 `<tag>` 换成目标标签 |
| `npm run check:encoding` | 检查 UTF-8 BOM 与 LF 换行 |
| `npm run format:encoding` | 统一文本文件的 BOM 与换行 |

自动检查不能代替浏览器实机验证；`check:store` 只覆盖脚本中的结构性检查，不验证网页链接是否在线，也不判断所有文案或截图是否与当前功能一致。

## 打包与发布

```sh
npm ci
npm test
npm run package:all
```

输出命名如下，`<version>` 来自 `package.json`：

```text
release/ba-click-fx-extension-v<version>-chromium.zip
release/ba-click-fx-extension-v<version>-firefox.zip
release/ba-click-fx-extension-v<version>-firefox-source.zip
release/SHA256SUMS.txt
```

Chrome 和 Edge 共用 Chromium ZIP；Firefox 使用独立 Firefox ZIP。浏览器 ZIP 的根目录直接包含 `manifest.json`，源码 ZIP 用于审核重建。

准备新发布时，同步 `package.json`、`manifest.json`、`CHANGELOG.md`、`SOURCE_BUILD.md` 与 [store-submission/metadata.json](../store-submission/metadata.json) 中的版本、包名和哈希，再运行发布校验。下面的 PowerShell 示例从包配置读取标签，避免复制旧版本：

```powershell
$releaseTag = 'v' + (Get-Content -Raw package.json | ConvertFrom-Json).version
npm run check:release -- $releaseTag
```

元数据描述最后一组已准备发布物；文档改动也会改变重新生成的源码 ZIP。日常文档修改不应覆盖已发布包的记录；准备下一次发布时再统一更新。

实际发布流程见[商店发布清单](../store-submission/release-checklist.md)，浏览器验证分别使用 [Chrome/Edge 清单](../store-submission/LOCAL_TEST_CHECKLIST.md)和 [Firefox 清单](../store-submission/FIREFOX_TEST_CHECKLIST.md)。GitHub Release 工作流在推送 `v*` 标签后构建、打包、验证并上传附件；商店提交需另行完成。

商店图片位于 [store-assets](../store-assets/)，展示页源文件位于 [store-assets/source](../store-assets/source/)。现有 PNG 可能来自历史构建，提交前应运行当前构建并重新核对或生成截图。

## 核心依赖更新

核心通过 npm 精确依赖 `ba-click-fx`，构建时由 esbuild 打入内容脚本。实际版本以 `package.json` 和锁文件为准；仓库不维护核心源码副本。

Dependabot 每周检查 npm 依赖，并通过 PR 触发 CI。手动更新：

```sh
npm install --save-exact ba-click-fx@latest
npm test
```

升级后核对公开 Schema 数量、默认值、预设映射和渲染行为，并同步相关文档。适配入口见 [src/content.js](../src/content.js)，设置模型见 [src/shared/settings.js](../src/shared/settings.js)。

## 项目结构与编码

```text
_locales/               中英文界面文案
assets/、icons/         SVG 源图与扩展图标
docs/                   使用细节、渲染和开发文档
manifests/              Chromium / Firefox 的 Manifest 覆盖
src/content.js          网页内容脚本与核心引擎适配
src/popup/              工具栏弹窗
src/options/            完整设置页
src/shared/             设置、存储、本地化和合成共用逻辑
scripts/                构建、打包、校验与 Star 历史脚本
test/                   核心合同与设置测试
store-assets/           商店图片与本地展示页
store-submission/       商店文案、元数据与发布清单
dist/、dist-firefox/    生成的扩展目录（不提交）
release/                生成的 ZIP 与哈希清单（不提交）
manifest.json           共用的 Manifest V3 基础清单
```

文本文件与构建出的文本资源使用 **UTF-8 with BOM + LF**。PNG、ZIP 等二进制文件按文件类型排除，不参与文本编码检查。
