# Development and release guide

[Back to README](../README.en.md) · [简体中文](./development.md)

## Environment and builds

Requires Node.js 24 or later and its bundled npm. From the root of a downloaded or cloned checkout:

```sh
npm ci
npm test
```

`npm ci` installs dependencies from the lockfile. `npm test` builds Chromium and Firefox, then runs unit tests, Manifest validation, store-asset checks, and encoding checks. See the [README](../README.en.md#install) for loading the builds in a browser.

| Command | Purpose |
| --- | --- |
| `npm run build` | Build Chromium into `dist` |
| `npm run build:firefox` | Build Firefox into `dist-firefox` |
| `npm run build:all` | Build both targets |
| `npm test` | Build both targets and run automated checks |
| `npm run test:star-history` | Check Star collection, CSV storage, and SVG generation separately |
| `npm run lint:firefox` | Validate the Firefox build with `web-ext`, treating warnings as errors |
| `npm run check:store` | Check store metadata, required files, URL formats, and dimensions of local images that exist |
| `npm run check:store -- --require-screenshots` | Require all screenshots and validate their dimensions before store submission |
| `npm run package` | Build and package Chromium |
| `npm run package:firefox` | Build, lint, and package Firefox |
| `npm run package:all` | Generate both browser packages, Firefox sources, and SHA-256 checksums |
| `npm run check:release -- <tag>` | Check the target tag, versions, three ZIPs, and recorded hashes after packaging; replace `<tag>` with the target tag |
| `npm run check:encoding` | Check UTF-8 BOM and LF line endings |
| `npm run format:encoding` | Normalize text BOMs and line endings |

Automated checks do not replace browser runtime verification. `check:store` performs the structural checks implemented in its script; it does not check whether public URLs are reachable or whether all copy and screenshots match the current features.

## Packaging and releases

```sh
npm ci
npm test
npm run package:all
```

Output names use `<version>` from `package.json`:

```text
release/ba-click-fx-extension-v<version>-chromium.zip
release/ba-click-fx-extension-v<version>-firefox.zip
release/ba-click-fx-extension-v<version>-firefox-source.zip
release/SHA256SUMS.txt
```

Chrome and Edge share the Chromium ZIP. Firefox uses its own ZIP. Browser ZIPs contain `manifest.json` directly at the root; the source ZIP is for reviewer rebuilds.

When preparing a new release, synchronize the versions, filenames, and hashes across `package.json`, `manifest.json`, `CHANGELOG.md`, `SOURCE_BUILD.md`, and [store-submission/metadata.json](../store-submission/metadata.json), then validate the release. This PowerShell example reads the tag from the package configuration:

```powershell
$releaseTag = 'v' + (Get-Content -Raw package.json | ConvertFrom-Json).version
npm run check:release -- $releaseTag
```

Metadata describes the last prepared set of release artifacts. Documentation edits also change a rebuilt source ZIP. Keep published artifact records intact during routine documentation work; synchronize them when preparing the next release.

Follow the [store release checklist](../store-submission/release-checklist.md), including the [Chrome/Edge runtime checklist](../store-submission/LOCAL_TEST_CHECKLIST.md) and [Firefox runtime checklist](../store-submission/FIREFOX_TEST_CHECKLIST.md). Pushing a `v*` tag triggers the GitHub Release workflow to build, package, validate, and upload assets. Store submission is a separate step.

Icons, promotional assets, and showcase sources live in [store-assets](../store-assets/). Use the [showcase pages](../store-assets/source/) to prepare screenshots locally at the paths listed in the store metadata. `store-assets/en/screenshot-*.png` and `store-assets/zh_CN/screenshot-*.png` are excluded from Git. Normal checks allow missing screenshots and validate those present. Before store submission, run `npm run check:store -- --require-screenshots` and verify that the screenshots show the target build.

## Updating the core dependency

The extension pins an exact npm version of `ba-click-fx`, which esbuild bundles into the content script. See `package.json` and the lockfile for the version; this repository does not keep a copy of the core source.

Dependabot checks npm dependencies weekly and its pull requests trigger CI. To update manually:

```sh
npm install --save-exact ba-click-fx@latest
npm test
```

After upgrading, check the public Schema count, defaults, preset mappings, and rendering behavior, then update the relevant documentation. The adapter is in [src/content.js](../src/content.js); the settings model is in [src/shared/settings.js](../src/shared/settings.js).

## Project structure and encoding

```text
_locales/               Chinese and English interface text
assets/, icons/         SVG sources and extension icons
docs/                   Detailed usage, rendering, and development guides
manifests/              Chromium / Firefox Manifest overrides
src/content.js          Webpage content script and core adapter
src/popup/              Toolbar popup
src/options/            Full settings page
src/shared/             Shared settings, storage, localization, and compositing
scripts/                Build, package, validation, and Star history scripts
test/                   Core contract and settings tests
store-assets/           Store images and local showcase pages
store-submission/       Store copy, metadata, and release checklists
dist/, dist-firefox/    Generated extension directories (not committed)
release/                Generated ZIPs and checksums (not committed)
manifest.json           Shared Manifest V3 base
```

Text files and generated text resources use **UTF-8 with BOM + LF**. Binary files such as PNGs and ZIPs are excluded from text encoding checks by file type.
