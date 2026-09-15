# BA Click FX Extension

Add Blue Archive-inspired click rings, particle fragments, and cursor trails to ordinary webpages. A Manifest V3 browser extension built on [ba-click-fx](https://github.com/CialloKing/ba-click-fx), with builds for Chrome, Edge, and Firefox.

[简体中文](./README.md) · [Install](#install) · [Usage](#usage) · [Core effects demo](https://ba-click-fx.cialloking.top/) · [Changelog](./CHANGELOG.md) · [Report an issue](https://github.com/CialloKing/ba-click-fx-extension/issues)

## Features

- Enabled after installation, with separate click/trail controls and a per-site switch.
- Four presets in both the popup and Full settings: Close to original, Light background, Soft, and Power saving.
- Full settings for color, opacity, size, render mode, timing, and all 66 public effect parameters in the upstream Schema.
- Simplified Chinese and English interfaces, with automatic browser-language selection and support for the system reduced-motion preference.
- Local rendering with no telemetry or remote code. The overlay preserves page layout and lets mouse events pass through.
- Browser sync for preferences; disabled-site rules stay on this device. Background tabs release rendering resources and restore them when visible again.

## Install

### Chrome / Edge

Requires Chrome / Edge 102 or later. Downloaded builds do not require Node.js.

1. Open the [latest Release](https://github.com/CialloKing/ba-click-fx-extension/releases/latest) and download the attachment ending in `-chromium.zip`.
2. Extract it to a permanent directory. Use the browser build; GitHub's automatic **Source code** downloads contain the project sources.
3. Open `chrome://extensions/` or `edge://extensions/` and enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted directory that directly contains `manifest.json`.
5. Open or refresh an ordinary HTTP/HTTPS webpage.

Keep the loaded directory. To update, replace its contents with the new Chromium build, click **Reload** on the extension management page, then refresh your webpages.

### Firefox (temporary installation)

Requires Firefox Desktop 140 or later. Downloaded builds do not require Node.js.

1. Download the attachment ending in `-firefox.zip` from the [latest Release](https://github.com/CialloKing/ba-click-fx-extension/releases/latest). The `-firefox-source.zip` attachment is source code for review.
2. Open `about:debugging#/runtime/this-firefox` and select **Load Temporary Add-on**.
3. Choose the Firefox ZIP, or extract it and select its `manifest.json`.
4. Open or refresh an ordinary HTTP/HTTPS webpage.

**Temporary installation ends when Firefox restarts; load the add-on again to continue using it.** Persistent installation requires a Mozilla-signed add-on. Release ZIPs are for temporary testing and review submission. See [Mozilla's temporary installation guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

### Build from source

Requires Node.js 24 or later. Download and extract the [project source](https://github.com/CialloKing/ba-click-fx-extension/archive/refs/heads/main.zip), then open a terminal in the project root:

```sh
npm ci
npm run build:all
```

- Chrome / Edge: follow the loading steps above and choose `dist`.
- Firefox: temporarily load `dist-firefox/manifest.json`.

See the [development and release guide](./docs/development.en.md) for more commands.

## Usage

1. **Click the webpage** to display rings and particle fragments.
2. **Hold a mouse button and move** to display the trail. Enable **Always show while moving** in the popup for a trail during ordinary pointer movement.
3. Open the extension from the browser toolbar to change effect controls, presets, or the current-site switch, or select **Preview click effect**.
4. Open **Full settings** for all parameters, language and motion preferences, and searchable website rules that you can remove or clear.

| Preset | Use when | Main changes |
| --- | --- | --- |
| Close to original (default) | Using the extension day to day | Full WebGL2, default blue and intensity, Screen compositing over the page |
| Light background | Effects are hard to see on white or light pages | Keeps Full WebGL2 and adjusts the overlay for better visibility |
| Soft | You want smaller, subtler effects | Lower opacity and size, Canvas 2D with native glow |
| Power saving | You want less rendering overhead | Default color and size, lower opacity and rendering resolution, native glow |

Presets apply appearance, render mode, the device pixel ratio cap (DPR), and compositing together. Manual changes to these values are shown as **Custom**. Preset changes preserve click/trail toggles, detailed effect parameters, timing, HDR presentation controls, language, and motion preferences. See the [preset and rendering guide](./docs/rendering-guide.en.md) for the parameter mapping.

## FAQ and limitations

### No effects after installing or updating

Refresh the webpage, then check the global, current-site, and click/trail switches in the popup. Browser internal pages, extension stores, and some built-in PDF viewers prohibit content scripts. Test on an ordinary webpage.

### No trail when moving the mouse

By default, hold a mouse button while moving. If **Always show while moving** is enabled but you still only see a trail while dragging, check the motion preference in Full settings. **Reduce continuous motion**, or following a system preference that requests reduced motion, suppresses the continuous trail. Click effects and trails while pressing the pointer remain available.

### No effects on local files or embedded content

For `file://` pages in Chrome / Edge, enable **Allow access to file URLs** in the extension details. The extension only runs in top-level documents; interactions inside iframes such as embedded videos, editors, or maps do not trigger its effects.

### How website rules are grouped

HTTP/HTTPS rules use the origin: scheme, domain, and port. Paths under the same origin share one switch; all `file://` pages share one rule. Rules stay on this device and do not sync with visual preferences.

### Choosing a render mode or language

Full WebGL2 is the default. Soft and Power saving use lighter rendering paths. Experimental WebGPU HDR must be selected manually in Full settings, and the actual output depends on browser and device support. See [render modes and HDR](./docs/rendering-guide.en.md#render-modes-and-hdr).

The language option labeled **Follow system** checks the browser UI language first, then browser language preferences. Chinese selects Simplified Chinese; other languages select English; detection failures fall back to Chinese. You can also select 简体中文 or English manually.

## Permissions and privacy

| Permission or access scope | Purpose |
| --- | --- |
| `storage` | Sync visual, interface, and motion preferences; keep explicitly disabled website origins locally |
| `activeTab` | Identify the current website when opening the popup and send a user-requested preview to that tab |
| HTTP, HTTPS, and file content-script matches | Receive pointer events and draw effects automatically on permitted pages |

The extension temporarily processes pointer coordinates and the current website origin. It does not read page text, forms, passwords, or cookies, and sends no data to the developer. The extension itself has no telemetry, ads, or network requests. When browser sync is enabled, the browser provider may synchronize preferences under the browser's sync settings and privacy policy. See the full [privacy policy](./PRIVACY.md).

## Development and releases

- [Development and release guide](./docs/development.en.md): environment, builds, checks, packages, and core dependency updates.
- [Preset and rendering guide](./docs/rendering-guide.en.md): API mappings, compositing, and HDR output.
- [Store submission kit](./store-submission/README.md): Chrome, Edge, and Firefox listing copy, permission explanations, assets, and release checklists.
- [Firefox source build instructions](./SOURCE_BUILD.md): rebuilding from the source archive for review.

The core dependency is pinned through npm and bundled into the extension at build time. Rendering after installation needs no npm, CDN, or network access. See [package.json](./package.json) and [package-lock.json](./package-lock.json) for the exact versions.

## Star history

[![ba-click-fx-extension Star history](https://raw.githubusercontent.com/CialloKing/ba-click-fx-extension/refs/heads/star-history/star-history.svg)](https://github.com/CialloKing/ba-click-fx-extension/blob/star-history/stars.csv)

[View the source CSV](https://github.com/CialloKing/ba-click-fx-extension/blob/star-history/stars.csv). Data lives on the separate `star-history` branch, with GitHub Actions scheduled daily at 03:17 Beijing time. `reconstructed` marks history rebuilt from current stargazers and cannot recover removed Stars; `observed` marks daily measurements. Missed dates remain missing, without interpolation.

## Project notes and license

This project was primarily generated and iterated with AI (**no handwritten code**). It is an unofficial fan project with no affiliation, partnership, or endorsement from the Blue Archive project.

Licensed under the [MIT License](./LICENSE). See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the core library's source and license.
