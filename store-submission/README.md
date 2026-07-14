# Store Submission Kit

This directory preserves the actual Chrome Web Store `1.0.2` submission record, the prepared Chromium `1.0.5` update, and the Firefox/AMO materials for BA Click FX `1.0.6`.

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
- [firefox-addons.md](./firefox-addons.md): actual Firefox `1.0.6` package details, AMO listing copy, privacy answers, reviewer notes, and manual submission steps.
- [FIREFOX_TEST_CHECKLIST.md](./FIREFOX_TEST_CHECKLIST.md): required Firefox runtime verification before creating the `v1.0.6` Tag.
- [metadata.json](./metadata.json): machine-readable version, URL, locale, package, and asset inventory.

## Required upload files

- Chromium ZIP: `release/ba-click-fx-extension-v1.0.6-chromium.zip`
- Firefox ZIP: `release/ba-click-fx-extension-v1.0.6-firefox.zip`
- Firefox source ZIP: `release/ba-click-fx-extension-v1.0.6-firefox-source.zip`
- SHA-256 inventory: `release/SHA256SUMS.txt`
- Logo: `store-assets/common/logo-300.png`
- Small promotional tile: `store-assets/common/promo-small-440x280.png`
- Marquee/large promotional tile: `store-assets/common/promo-marquee-1400x560.png`
- Four English screenshots: `store-assets/en/`
- Four Simplified Chinese screenshots: `store-assets/zh_CN/`

The store images use original project artwork and the extension UI/runtime. They do not use official Blue Archive logos, characters, screenshots, or game assets. Screenshot 1 is retained because the visible effect runtime is unchanged; screenshots 2–4 were regenerated from the final v1.0.6 build so the popup, per-site control, and full settings page match the submitted extension.

## Important disclosure decision

Chrome's official user-data guidance treats local processing and browser sync storage as data handling. The conservative and internally consistent submission is therefore:

- disclose **Web history** because the current origin is processed locally and user-disabled origins can be saved;
- disclose **User activity** because pointer coordinates and click/move events are processed transiently to draw effects;
- state clearly that neither category is logged, sent to the developer, used for analytics, or shared; and
- leave all unrelated data types unchecked.

Do not replace these answers with a blanket “no data handling” statement unless the code is changed to remove the corresponding behavior.

Firefox uses a different disclosure boundary. The Firefox Manifest declares `required: ["none"]` because no information leaves the add-on or local browser. Local pointer processing and browser-provided storage do not become developer collection or transmission. Keep the Chrome and AMO answers separate and follow [firefox-addons.md](./firefox-addons.md) for AMO.
