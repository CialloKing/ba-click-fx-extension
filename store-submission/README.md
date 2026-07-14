# Store Submission Kit

This directory preserves the actual Chrome Web Store `1.0.2` submission record and contains the updated metadata, privacy answers, reviewer instructions, and final checklist for publishing BA Click FX `1.0.5` to Chrome Web Store and Microsoft Edge Add-ons.

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
- [firefox-follow-up.md](./firefox-follow-up.md): intentionally deferred Firefox/AMO work.
- [metadata.json](./metadata.json): machine-readable version, URL, locale, package, and asset inventory.

## Required upload files

- Chromium ZIP: `release/ba-click-fx-extension-v1.0.5-chromium.zip`
- Logo: `store-assets/common/logo-300.png`
- Small promotional tile: `store-assets/common/promo-small-440x280.png`
- Marquee/large promotional tile: `store-assets/common/promo-marquee-1400x560.png`
- Four English screenshots: `store-assets/en/`
- Four Simplified Chinese screenshots: `store-assets/zh_CN/`

The store images use original project artwork and the extension UI/runtime. They do not use official Blue Archive logos, characters, screenshots, or game assets. The existing PNG set records the v1.0.2 submission; because v1.0.5 simplifies the popup and adds a full settings page, refresh screenshots 2 and 4 from the final v1.0.5 build before uploading the update.

## Important disclosure decision

Chrome's official user-data guidance treats local processing and browser sync storage as data handling. The conservative and internally consistent submission is therefore:

- disclose **Web history** because the current origin is processed locally and user-disabled origins can be saved;
- disclose **User activity** because pointer coordinates and click/move events are processed transiently to draw effects;
- state clearly that neither category is logged, sent to the developer, used for analytics, or shared; and
- leave all unrelated data types unchecked.

Do not replace these answers with a blanket “no data handling” statement unless the code is changed to remove the corresponding behavior.
