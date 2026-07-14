# v1.0.6 Release and Store Submission Checklist

## 1. Repository and public pages

- [ ] Review all working-tree changes and confirm only `v1.0.6` work is included.
- [ ] Confirm every repository text file passes UTF-8 BOM＋LF validation.
- [ ] Verify the demo, repository privacy policy, Issues support URL, and source repository without authentication.
- [ ] Confirm this repository still has no GitHub Pages deployment or `cialloking.com` configuration.

## 2. Build and automated verification

- [ ] Run `npm ci` with Node.js 22.
- [ ] Run `npm test`.
- [ ] Run `npm run package:all`.
- [ ] Run `npm run check:release -- v1.0.6`.
- [ ] Confirm `web-ext lint` reports zero errors, notices, and warnings.
- [ ] Confirm these files exist:
  - `ba-click-fx-extension-v1.0.6-chromium.zip`
  - `ba-click-fx-extension-v1.0.6-firefox.zip`
  - `ba-click-fx-extension-v1.0.6-firefox-source.zip`
  - `SHA256SUMS.txt`
- [ ] Confirm `manifest.json` is at each browser ZIP root.
- [ ] Confirm Chromium and Firefox ZIPs do not contain an extra `dist` directory layer.
- [ ] Re-run `npm run package:all` and confirm the three SHA-256 values remain unchanged.

## 3. Browser runtime verification

- [ ] Load `dist` in Chrome and complete [LOCAL_TEST_CHECKLIST.md](./LOCAL_TEST_CHECKLIST.md).
- [ ] Load `dist` in Edge and repeat the Chromium checklist.
- [ ] Load `dist-firefox/manifest.json` from `about:debugging#/runtime/this-firefox`.
- [ ] Complete [FIREFOX_TEST_CHECKLIST.md](./FIREFOX_TEST_CHECKLIST.md).
- [ ] Record the tested Firefox version, operating system, date, and result below.

Firefox runtime record:

```text
Firefox version:
Operating system:
Test date:
Result:
Tester:
```

Do not create the `v1.0.6` Tag until this Firefox runtime record is complete and the result is Pass.

## 4. Git and GitHub Release

- [ ] Commit implementation and documentation with Chinese commit messages.
- [ ] Push `main` and confirm the CI workflow passes.
- [ ] Confirm `CHANGELOG.md` contains the final `1.0.6` record.
- [ ] Create annotated Tag `v1.0.6` with a Chinese message.
- [ ] Push the Tag and wait for the Release workflow.
- [ ] Confirm the GitHub Release is public and not marked as a prerelease.
- [ ] Confirm the Release attaches all three ZIPs and `SHA256SUMS.txt`.
- [ ] Download the Release assets and compare their SHA-256 values with `SHA256SUMS.txt`.
- [ ] Confirm previous Tags, Releases, and ZIPs remain unchanged.

## 5. Firefox Add-ons

- [ ] Follow [firefox-addons.md](./firefox-addons.md) and choose **On this site**.
- [ ] Upload the Firefox ZIP, not the Chromium ZIP.
- [ ] Select Firefox Desktop as the compatible platform.
- [ ] Answer Yes to the source-code question and upload the Firefox source ZIP.
- [ ] Complete English and Simplified Chinese listing fields.
- [ ] Select Appearance, MIT, non-experimental, free, and no external requirements.
- [ ] Confirm the built-in data declaration says no collection or transmission.
- [ ] Add homepage, repository, support, and privacy-policy URLs.
- [ ] Upload the icon and localized screenshots.
- [ ] Paste the prepared English Notes for Reviewers.
- [ ] Submit the version and record the submission time and status.

## 6. Existing Chromium stores

The `v1.0.6` Chromium ZIP is generated to prove that the shared build remains compatible. Firefox support alone does not require an immediate Chrome Web Store or Edge Add-ons update. If a Chromium store update is submitted, use the `v1.0.6` ZIP and update the corresponding historical submission records without rewriting older entries.

## 7. After AMO submission

- [ ] Monitor AMO validation, review messages, and email notifications.
- [ ] Do not replace or rebuild the submitted `v1.0.6` package.
- [ ] Apply listing-only corrections in the AMO dashboard without changing the archive.
- [ ] Use a new extension version for any Manifest or executable-code correction.
- [ ] After approval, record the AMO item ID/URL and actual submitted text in the repository.
- [ ] Add the AMO install link to README only after the listing is live.
