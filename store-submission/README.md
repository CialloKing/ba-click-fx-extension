# Store Submission Kit

This directory preserves the historical Chrome Web Store records and contains the current Chrome, Edge, and Firefox submission materials for BA Click FX `1.1.3`.

## Canonical public URLs

- Homepage and live demo: https://ba-click-fx.cialloking.top/
- Chrome privacy policy: https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md
- Microsoft Edge privacy policy: https://github.com/CialloKing/ba-click-fx-extension/blob/main/PRIVACY.md
- Support: https://github.com/CialloKing/ba-click-fx-extension/issues
- Source and issues: https://github.com/CialloKing/ba-click-fx-extension

This repository does not use GitHub Pages. The public demo is hosted separately, while the privacy policy and support entry remain available through the public GitHub repository.

## Files

- [chrome-web-store.md](./chrome-web-store.md): Chrome listing, privacy fields, permission justifications, and data-use answers.
- [edge-addons.md](./edge-addons.md): Partner Center listing, privacy fields, search terms, and testing notes.
- [reviewer-notes.md](./reviewer-notes.md): concise certification instructions for both stores.
- [data-inventory.md](./data-inventory.md): code-to-disclosure inventory explaining every locally processed or stored value.
- [LOCAL_TEST_CHECKLIST.md](./LOCAL_TEST_CHECKLIST.md): Chrome/Edge manual loading and regression steps.
- [release-checklist.md](./release-checklist.md): ordered release and submission checklist.
- [firefox-addons.md](./firefox-addons.md): prepared Firefox `1.1.3` package details, AMO listing copy, privacy answers, reviewer notes, and manual submission steps.
- [FIREFOX_TEST_CHECKLIST.md](./FIREFOX_TEST_CHECKLIST.md): required Firefox runtime verification before creating the `v1.1.3` Tag.
- [metadata.json](./metadata.json): machine-readable version, URL, locale, package, and asset inventory.

## Required upload files

- Chromium ZIP: `release/ba-click-fx-extension-v1.1.3-chromium.zip`
- Firefox ZIP: `release/ba-click-fx-extension-v1.1.3-firefox.zip`
- Firefox source ZIP: `release/ba-click-fx-extension-v1.1.3-firefox-source.zip`
- SHA-256 inventory: `release/SHA256SUMS.txt`
- Logo: `store-assets/common/logo-300.png`
- Small promotional tile: `store-assets/common/promo-small-440x280.png`
- Marquee/large promotional tile: `store-assets/common/promo-marquee-1400x560.png`
- Four English screenshots: `store-assets/en/`
- Four Simplified Chinese screenshots: `store-assets/zh_CN/`

The store images use original project artwork and the extension UI/runtime. They do not use official Blue Archive logos, characters, screenshots, or game assets. Before submitting `v1.1.3`, regenerate the localized screenshots from the final build: the effect screenshot must show the current WebGL2 Bloom runtime, and the settings screenshot must show the complete upstream control panel.

## Important disclosure decision

Chrome's official user-data guidance treats local processing and browser sync storage as data handling. The conservative and internally consistent submission is therefore:

- disclose **Web history** because the current origin is processed locally and user-disabled origins can be saved;
- disclose **User activity** because pointer coordinates and click/move events are processed transiently to draw effects;
- state clearly that neither category is logged, sent to the developer, used for analytics, or shared; and
- leave all unrelated data types unchecked.

Do not replace these answers with a blanket “no data handling” statement unless the code is changed to remove the corresponding behavior.

Firefox uses a different disclosure boundary. The Firefox Manifest declares `required: ["none"]` because no information leaves the add-on or local browser. Local pointer processing and browser-provided storage do not become developer collection or transmission. Keep the Chrome and AMO answers separate and follow [firefox-addons.md](./firefox-addons.md) for AMO.
