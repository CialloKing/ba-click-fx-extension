# Store Submission Kit

This directory contains reusable Chrome, Edge, and Firefox submission materials and historical submission records for BA Click FX. Use [metadata.json](./metadata.json) for the last prepared release's version, package names, and SHA-256 values. See the [development and release guide](../docs/development.en.md) for build commands.

## Canonical public URLs

- [Homepage and core effects demo](https://ba-click-fx.cialloking.top/)
- [Privacy policy for Chrome and Edge](https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md)
- [Support and issues](https://github.com/CialloKing/ba-click-fx-extension/issues)
- [Source repository](https://github.com/CialloKing/ba-click-fx-extension)
- [GitHub Releases](https://github.com/CialloKing/ba-click-fx-extension/releases)

This repository does not use GitHub Pages. The public demo is hosted separately, while the privacy policy and support entry remain available through the public GitHub repository.

## Files

- [chrome-web-store.md](./chrome-web-store.md): Chrome listing, privacy fields, permission justifications, and data-use answers.
- [edge-addons.md](./edge-addons.md): Partner Center listing, privacy fields, search terms, and testing notes.
- [reviewer-notes.md](./reviewer-notes.md): concise certification instructions for both stores.
- [data-inventory.md](./data-inventory.md): code-to-disclosure inventory explaining every locally processed or stored value.
- [LOCAL_TEST_CHECKLIST.md](./LOCAL_TEST_CHECKLIST.md): Chrome/Edge manual loading and regression steps.
- [release-checklist.md](./release-checklist.md): reusable release and submission checklist; complete it for the target build.
- [firefox-addons.md](./firefox-addons.md): Firefox package references, AMO listing copy, privacy answers, reviewer notes, and manual submission steps.
- [FIREFOX_TEST_CHECKLIST.md](./FIREFOX_TEST_CHECKLIST.md): Firefox runtime verification for the target release.
- [history/release-1.0.6.md](./history/release-1.0.6.md): preserved release checklist and runtime report for that historical version.
- [metadata.json](./metadata.json): machine-readable version, URL, locale, package, and asset inventory.

## Required upload files

Read exact package filenames from [metadata.json](./metadata.json). The following patterns use `<version>` from `package.json`:

- Chromium ZIP: `release/ba-click-fx-extension-v<version>-chromium.zip`
- Firefox ZIP: `release/ba-click-fx-extension-v<version>-firefox.zip`
- Firefox source ZIP: `release/ba-click-fx-extension-v<version>-firefox-source.zip`
- SHA-256 inventory: `release/SHA256SUMS.txt`
- Logo: `store-assets/common/logo-300.png`
- Small promotional tile: `store-assets/common/promo-small-440x280.png`
- Marquee/large promotional tile: `store-assets/common/promo-marquee-1400x560.png`
- Four English screenshots, prepared locally: `store-assets/en/`
- Four Simplified Chinese screenshots, prepared locally: `store-assets/zh_CN/`

The extension version, core version, filenames, and SHA-256 fields in `metadata.json` describe one prepared set of release artifacts. Synchronize them when preparing a new release, then run `npm run check:release -- <tag>` with the intended tag. Documentation changes can alter a rebuilt source ZIP; preserve the metadata of already published artifacts until the next release is prepared.

Screenshot PNGs are local outputs excluded from Git; the showcase sources remain in [store-assets/source](../store-assets/source/). Before submitting a release, generate the localized screenshots from the final build at the paths listed in `metadata.json`, then run `npm run check:store -- --require-screenshots`. Show the current runtime and settings, including the HDR presentation controls, public Schema panel, and host controls. Use original project artwork and the extension UI/runtime, without official Blue Archive logos, characters, screenshots, or game assets. Passing the image-dimension check alone does not confirm that a screenshot is current.

## Important disclosure decision

Chrome's official user-data guidance treats local processing and browser sync storage as data handling. The conservative and internally consistent submission is therefore:

- disclose **Web history** because the current origin is processed locally and user-disabled origins can be saved;
- disclose **User activity** because pointer coordinates and click/move events are processed transiently to draw effects;
- state clearly that neither category is logged, sent to the developer, used for analytics, or shared; and
- leave all unrelated data types unchecked.

Do not replace these answers with a blanket “no data handling” statement unless the code is changed to remove the corresponding behavior.

Firefox uses a different disclosure boundary. The Firefox Manifest declares `required: ["none"]` because no information leaves the add-on or local browser. Local pointer processing and browser-provided storage do not become developer collection or transmission. Keep the Chrome and AMO answers separate and follow [firefox-addons.md](./firefox-addons.md) for AMO.
