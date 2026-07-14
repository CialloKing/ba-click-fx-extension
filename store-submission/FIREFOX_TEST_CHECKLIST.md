# Firefox v1.0.6 Runtime Checklist

Complete this checklist before creating the `v1.0.6` Tag and GitHub Release.

## Temporary installation

- [ ] Install a current Firefox Desktop release (`140.0` or newer).
- [ ] Run `npm ci`, `npm test`, and `npm run package:all`.
- [ ] Open `about:debugging#/runtime/this-firefox`.
- [ ] Select **Load Temporary Add-on** and choose `dist-firefox/manifest.json`.
- [ ] Confirm Firefox shows version `1.0.6` and Gecko ID `ba-click-fx-extension@cialloking.top`.
- [ ] Confirm the extension console has no uncaught startup errors.

## Ordinary webpage behavior

- [ ] Open `https://example.com/`; refresh once if it was open before installation.
- [ ] Click the page and confirm the ring and particle effect appears.
- [ ] Move and drag the pointer and confirm the cursor trail appears.
- [ ] Confirm the overlay does not block links, text selection, scrolling, or page buttons.
- [ ] Confirm only one `data-ba-click-fx-extension-root` host exists in the top-level document.
- [ ] Switch the tab to the background and back; confirm Canvas resources are restored without duplicate hosts.
- [ ] Navigate away, use Back/Forward, and confirm BFCache restoration remains functional.

## Popup and full settings

- [ ] Test global, current-site, click, trail, continuous-trail, and preview controls.
- [ ] Open Full settings and test Classic, Soft, Power-saving, and Custom appearance states.
- [ ] Test color, opacity, size, and all three quality modes.
- [ ] Test system, Simplified Chinese, and English language modes.
- [ ] Test system, full, and reduced continuous-motion modes.
- [ ] Disable `https://example.com`, confirm the Canvas is removed, then restore the site rule.
- [ ] Confirm visual settings persist through a Firefox restart when installed through a persistent test profile or signed build.
- [ ] Confirm local website rules remain in `storage.local` and schema v2 migration does not duplicate or delete rules.
- [ ] Confirm the repository, privacy, support, and demo links open the expected HTTPS pages.

## Restrictions and optional checks

- [ ] Confirm `about:` pages, addons.mozilla.org, and built-in PDF pages show a clear unsupported/not-loaded state.
- [ ] Optionally grant local-file access and test a local HTML page.
- [ ] Confirm local-file access is not required for the primary HTTP/HTTPS test.
- [ ] In `about:addons`, confirm the permissions and the no-data-collection declaration are consistent with the submitted documentation.

Record the Firefox version, operating system, test date, and any deviations in the release checklist before publishing.
