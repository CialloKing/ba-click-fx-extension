# Release and Store Submission Checklist

Use this template for each target release. Fill checkboxes and runtime results only after verifying that build. The original [v1.0.6 checklist and runtime record](./history/release-1.0.6.md) are preserved as history.

## 1. Prepare the release

- [ ] Review the changes and choose the target version in `package.json`.
- [ ] Synchronize the lockfile, Manifest, changelog, and `SOURCE_BUILD.md`.
- [ ] Review both READMEs and their guides for current defaults, installation steps, and parameter descriptions.
- [ ] Check the public demo, repository, privacy-policy, and support links.
- [ ] Review current store copy and screenshots; preserve clearly labeled historical submission records.

## 2. Build and validate

Follow the [development and release guide](../docs/development.en.md#packaging-and-releases).

- [ ] Run `npm ci` using Node.js 24 or later.
- [ ] Run `npm test` and `npm run package:all`.
- [ ] Confirm Firefox lint has zero errors, notices, and warnings.
- [ ] Confirm the Chromium ZIP, Firefox ZIP, Firefox source ZIP, and `SHA256SUMS.txt` exist for the target version.
- [ ] Confirm each browser ZIP has `manifest.json` directly at its root.
- [ ] Synchronize versions, archive names, and SHA-256 values in [metadata.json](./metadata.json) with the prepared artifacts.
- [ ] Run `npm run check:release -- <tag>`, replacing `<tag>` with the target tag derived from `package.json`.
- [ ] Repackage and confirm all three ZIP hashes remain unchanged.

## 3. Verify in browsers

- [ ] Complete [LOCAL_TEST_CHECKLIST.md](./LOCAL_TEST_CHECKLIST.md) in Chrome and Edge.
- [ ] Complete [FIREFOX_TEST_CHECKLIST.md](./FIREFOX_TEST_CHECKLIST.md) in Firefox Desktop.
- [ ] Record the actual test environment and outcome for each browser below. Resolve failures before tagging.

```text
Extension version:
Browser and version:
Operating system:
Test date:
Result and deviations:
Tester:
```

## 4. Publish the GitHub Release

- [ ] Commit the prepared changes with Chinese commit messages.
- [ ] Push the branch and confirm CI passes.
- [ ] Create and push an annotated target-version tag with a Chinese message.
- [ ] Confirm the Release workflow succeeds and the release has the intended visibility and prerelease status.
- [ ] Confirm all three ZIPs and `SHA256SUMS.txt` are attached.
- [ ] Download the published artifacts and verify their hashes against the prepared metadata and checksums.
- [ ] Keep previous tags, releases, and uploaded archives unchanged.

## 5. Submit to stores

- [ ] Prepare the local screenshots listed in `metadata.json` and run `npm run check:store -- --require-screenshots`.
- [ ] Use the Chromium ZIP for Chrome/Edge and the Firefox ZIP for AMO.
- [ ] Follow [Chrome](./chrome-web-store.md), [Edge](./edge-addons.md), or [Firefox](./firefox-addons.md) submission instructions for each intended store.
- [ ] Provide the Firefox source ZIP when AMO requests source code.
- [ ] Review the listing languages, permissions, privacy answers, current screenshots, and reviewer notes.
- [ ] Record the actual item ID, submitted version, time, status, and dashboard response for each submission.

## 6. After submission

- [ ] Check store validation and review feedback; record any requested action.
- [ ] Preserve submitted archives. Use a new version for code or package corrections.
- [ ] Record the final store decision and public listing URL.
- [ ] Add store installation links to the README only after the listings are publicly available.
