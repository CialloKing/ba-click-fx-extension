# 预设、渲染与核心参数

[返回 README](../README.md)

## 预设与核心 API 的映射

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

## 渲染模式与 HDR

完整设置提供以下模式。模式表示请求的渲染配置，实际后端以核心运行时状态为准。

| 模式 ID | 点击与粒子后端 | 辉光后端配置 |
| --- | --- | --- |
| `full-webgl2`（默认） | `webgl2` | `webgl2` |
| `full-webgpu` | `webgpu` | `webgl2` |
| `software-bloom` | `canvas2d` | `software` |
| `webgl2-bloom` | `canvas2d` | `webgl2` |
| `native-bloom` | `canvas2d` | `native` |

WebGPU 模式请求由 WebGPU 管线负责效果；表中的 `bloomBackend` 是传入核心的配置字段，不应据此把实际 WebGPU 管线描述为 WebGL2 渲染。四个内置预设均不主动选择 WebGPU HDR。

WebGPU HDR 是实验选项。六项展示校准为 `webgpuHdrPeak`、`webgpuHdrBrightness`、`webgpuHdrColorPreservation`、`webgpuHdrWhiteCore`、`webgpuHdrWhiteStart` 和 `webgpuHdrWhiteEnd`，仅作用于 Extended 输出，不改写 Unity 特效参数。

选择 HDR 模式不等于 HDR 已生效。核心 `getConfig()` 返回的 `resolvedWebGPUOutputMode === 'extended'` 表示浏览器侧启用了 Extended 输出，`standard` 仍为 SDR；实际显示还取决于设备和系统的 HDR 能力。内容脚本会把该字段与实际后端一起保存在状态响应中，供运行时诊断使用。

## 网页合成与精细参数

扩展面对的是无法预先采样的网页背景。默认使用 `browser-overlay` 透明输出，由内容脚本创建的固定宿主执行 CSS `mix-blend-mode: screen`，界面称为“DOM Add（近似）”。完整设置还可显式选择 Scene、Source-over、Plus-lighter、隔离合成和浅色背景对比。

`hostCompositingSurface: 'native'` 表示最终合成由扩展外层宿主接管。Canvas 位于 closed Shadow DOM 内，宿主和容器均使用 `pointer-events: none`，不拦截鼠标事件。

[fx-settings.js](../src/shared/fx-settings.js) 从上游 `FX_PARAM_SCHEMA` 派生 66 项公开特效控件，参数类型、默认值和边界由上游维护。扩展保存经过校验的参数覆盖，并通过核心 `setFxParams()` 应用。不要仅为扩展界面维护另一份默认参数表；核心升级后应核对 Schema 和中英文文档。
