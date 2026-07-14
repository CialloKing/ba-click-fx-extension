# Release and Store Submission Checklist

## 1. Repository and public pages

- [ ] Review all changes in the working tree.
- [ ] Commit with a Chinese commit message and push `main`.
- [ ] Open and verify the independent demo homepage, GitHub privacy policy, and Issues support URL without authentication.
- [ ] Confirm all public URLs use HTTPS and return no 404/redirect loop.

## 2. Build and local verification

- [ ] Run `npm ci`.
- [ ] Run `npm test`.
- [ ] Run `npm run package`.
- [ ] Confirm the ZIP name is `ba-click-fx-extension-v1.0.5-chromium.zip`.
- [ ] Confirm `manifest.json` is at the ZIP root.
- [ ] Confirm all source, build, locale, documentation, and store-submission text files pass UTF-8 BOM + LF validation.
- [ ] Load `dist` in Chrome developer mode and execute [LOCAL_TEST_CHECKLIST.md](./LOCAL_TEST_CHECKLIST.md).
- [ ] Load the same `dist` in Edge developer mode and execute the same checklist.
- [ ] Refresh localized screenshots 2 and 4 from v1.0.5; do not reuse the v1.0.2 popup/appearance screenshots unchanged.

## 3. GitHub release

- [ ] Confirm `CHANGELOG.md` has no unresolved `Unreleased` entries intended for `1.0.5`.
- [ ] Confirm generated `dist` files are not tracked and CI rebuilds them successfully.
- [ ] Run `npm run check:release -- v1.0.5`.
- [ ] Create annotated tag `v1.0.5` with a Chinese tag message. Do not create `v1.0.4`.
- [ ] Push the tag.
- [ ] Confirm the release workflow creates a GitHub Release and attaches the Chromium ZIP.
- [ ] Download the release ZIP and compare its SHA-256 with the locally generated package if reproducibility is required.
- [ ] Confirm the release contains only the `v1.0.5` Chromium ZIP and that the `v1.0.2` Release remains unchanged.

## 4. Chrome Web Store

- [ ] Register/verify the developer account and enable two-step verification.
- [ ] Upload the Chromium ZIP.
- [ ] Complete English and Simplified Chinese detailed descriptions.
- [ ] Upload the common 440×280 promo tile.
- [ ] Upload four 1280×800 screenshots for each locale.
- [ ] Add homepage, support, and Chrome privacy URLs.
- [ ] Paste the single-purpose and permission justifications.
- [ ] Select “No, I am not using remote code.”
- [ ] Complete the conservative Web history/User activity data disclosures and Limited Use certifications.
- [ ] Set free pricing, no in-app purchases, no mature content, and intended regions/visibility.
- [ ] Paste reviewer notes and submit for review.

## 5. Microsoft Edge Add-ons

- [ ] Register/verify the Partner Center extension developer account.
- [ ] Upload the same Chromium ZIP.
- [ ] Complete the dedicated Privacy page.
- [ ] Use the Edge-specific privacy-policy URL.
- [ ] Complete English and Simplified Chinese descriptions and search terms.
- [ ] Upload/duplicate the 300×300 logo, 440×280 small tile, 1400×560 large tile, and localized screenshots.
- [ ] Paste certification notes.
- [ ] Set Public visibility, selected markets, free pricing, and no mature content.
- [ ] Submit for certification.

## 6. After submission

- [ ] Record Chrome and Edge item IDs/URLs in README and `metadata.json` after approval.
- [ ] Add official store badges only after listings are live.
- [ ] Monitor reviewer messages and respond without changing the package unless required.
- [ ] If code or Manifest metadata changes, increment the extension version and rebuild/re-upload.
