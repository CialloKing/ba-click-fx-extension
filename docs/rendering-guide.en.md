# Presets, rendering, and core parameters

[Back to README](../README.en.md) · [简体中文](./rendering-guide.md)

## Preset mappings to the core API

The popup and Full settings share `getAppearancePresetPatch()`. The content script passes its settings to the `BAClickFX` constructor or `updateConfig()`. Defaults below refer to the extension's `DEFAULT_SYNC_SETTINGS`, not a bare upstream instance. Preset overrides are listed relative to those extension defaults.

Every preset starts from this extension compositing baseline. Light background overrides four of its fields as shown in the table:

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

The extension's `color` setting maps to the core's `themeColor`. `renderMode: 'full-webgl2'` expands to `effectBackend: 'webgl2'` and `bloomBackend: 'webgl2'`.

Close to original and Light background both use `themeColor: '#4ca7ff'`, `opacity: 1`, `scale: 1`, `effectBackend: 'webgl2'`, `bloomBackend: 'webgl2'`, and `maxDpr: 2`. Soft and Power saving override the appearance/rendering fields listed below.

| Preset | Internal ID | API overrides relative to extension defaults | Result |
| --- | --- | --- | --- |
| Close to original | `classic` | None; retains `overlayAlphaPolicy: 'coverage'`, `overlayColorCompensation: 'none'`, `overlayAlphaLimit: 250 / 255`, `hostCompositing: 'screen'` | A transparent overlay with outer-host Screen blending, labeled “DOM Add (approx.)” in the UI. |
| Light background | `light-background` | `overlayAlphaPolicy: 'visual-max'`; `overlayColorCompensation: 'bright-core'`; `overlayAlphaLimit: 0.85`; `hostCompositing: 'source-over'` | Source-over improves bright-core visibility on light pages while the alpha cap limits background occlusion. |
| Soft | `soft` | `themeColor: '#8edcff'`; `opacity: 0.35`; `scale: 0.9`; `effectBackend: 'canvas2d'`; `bloomBackend: 'native'`; `maxDpr: 1` | Lower intensity and resolution, using Canvas 2D with native glow. |
| Power saving | `performance` | `opacity: 0.45`; `effectBackend: 'canvas2d'`; `bloomBackend: 'native'`; `maxDpr: 1` | Default theme color and size, with lower opacity and a lighter rendering path. |

With `hostCompositing: 'screen'` or `'plus-lighter'`, the core ignores the overlay alpha policy, color compensation, and alpha limit. Those three fields remain part of the Close to original preset's baseline but do not actively tune Screen output. Light background uses `source-over`, so its four overrides participate in output. All four presets keep `isolatedCompositing: false` and `lightBackgroundContrastAlpha: 0`, adding neither an isolated transparency group nor a pale-cyan contrast outline.

The adapter also fixes `inputSource: 'dom'` and `hostCompositingSurface: 'native'`. `preset` is an extension state marker, not a core `BAClickFX` parameter. Preset changes do not rewrite `fxParams`, click/trail toggles, time scales, HDR presentation controls, language, or motion preferences.

## Render modes and HDR

Full settings provides these modes. They describe the requested configuration; the core's runtime state reports the actual backend.

| Mode ID | Click and particle backend | Bloom backend configuration |
| --- | --- | --- |
| `full-webgl2` (default) | `webgl2` | `webgl2` |
| `full-webgpu` | `webgpu` | `webgl2` |
| `software-bloom` | `canvas2d` | `software` |
| `webgl2-bloom` | `canvas2d` | `webgl2` |
| `native-bloom` | `canvas2d` | `native` |

WebGPU mode requests the WebGPU effect pipeline. The `bloomBackend` column is the configuration passed to the core; its value does not mean the actual WebGPU pipeline renders through WebGL2. None of the four built-in presets selects WebGPU HDR.

WebGPU HDR is experimental. Its six presentation controls are `webgpuHdrPeak`, `webgpuHdrBrightness`, `webgpuHdrColorPreservation`, `webgpuHdrWhiteCore`, `webgpuHdrWhiteStart`, and `webgpuHdrWhiteEnd`. They only affect Extended output and do not rewrite Unity effect parameters.

Selecting HDR mode does not confirm HDR output. In the core's `getConfig()` snapshot, `resolvedWebGPUOutputMode === 'extended'` indicates browser-side Extended output; `standard` remains SDR. The displayed result also depends on device and system HDR capabilities. The content script includes this field and the resolved backends in its status response for runtime diagnostics.

## Page compositing and detailed parameters

The extension cannot sample arbitrary webpage backgrounds in advance. It defaults to `browser-overlay` transparency, with the content script's fixed host applying CSS `mix-blend-mode: screen`, labeled “DOM Add (approx.)”. Full settings also allows Scene, Source-over, Plus-lighter, isolated compositing, and light-background contrast.

`hostCompositingSurface: 'native'` delegates final compositing to the extension's outer host. The Canvas lives inside a closed Shadow DOM. Both the host and container use `pointer-events: none` so mouse events pass through.

[fx-settings.js](../src/shared/fx-settings.js) derives 66 public effect controls from the upstream `FX_PARAM_SCHEMA`. The upstream library owns types, defaults, and bounds. The extension saves validated overrides and applies them through the core's `setFxParams()`. Avoid maintaining a separate parameter-default table for the extension UI; review the Schema and both language versions of the documentation after core updates.
