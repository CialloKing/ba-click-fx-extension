# Firefox Source Build Instructions

This source archive rebuilds the Firefox package submitted for BA Click FX Extension `v1.1.2`.

## Environment

- Node.js `24.x`
- npm supplied with Node.js 24
- Windows, macOS, or Linux; the release workflow uses Ubuntu with Node.js 24
- Internet access is required only for `npm ci` to download the exact dependencies in `package-lock.json`

No global build tools are required. The build does not download or embed runtime code after `npm ci`.

## Rebuild

Run these commands from the source archive root:

```text
npm ci
npm run build:firefox
npm run lint:firefox
npm run package:firefox
```

The unpacked extension is written to `dist-firefox/`. The AMO upload ZIP is written to:

```text
release/ba-click-fx-extension-v1.1.2-firefox.zip
```

The submitted Firefox ZIP contains the files from `dist-firefox/` directly at the archive root. `manifest.json` must therefore be at the ZIP root, not inside a `dist-firefox/` directory.

The package script sorts every archive entry and assigns a fixed timestamp. A clean rebuild from this source archive produces the same ZIP content and SHA-256 as the submitted Firefox package.
