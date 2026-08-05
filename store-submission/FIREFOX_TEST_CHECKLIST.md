# Firefox v1.1.14 Runtime Checklist

Complete this checklist before creating the `v1.1.14` Tag and GitHub Release.

## Temporary installation

- [ ] Install a current Firefox Desktop release (`140.0` or newer).
- [ ] Run `npm ci`, `npm test`, and `npm run package:all`.
- [ ] Open `about:debugging#/runtime/this-firefox`.
- [ ] Select **Load Temporary Add-on** and choose `dist-firefox/manifest.json`.
- [ ] Confirm Firefox shows version `1.1.14` and Gecko ID `ba-click-fx-extension@cialloking.top`.
- [ ] Confirm the extension console has no uncaught startup errors.

## Ordinary webpage behavior

- [ ] Open `https://example.com/`; refresh once if it was open before installation.
- [ ] Click the page and confirm the ring and particle effect appears.
- [ ] Move and drag the pointer and confirm the cursor trail appears.
- [ ] Confirm the overlay does not block links, text selection, scrolling, or page buttons.
- [ ] Confirm only one `data-ba-click-fx-extension-root` host exists in the top-level document.
- [ ] Switch the tab to the background and back; confirm rendering resources are restored without duplicate hosts.
- [ ] Navigate away, use Back/Forward, and confirm BFCache restoration remains functional.

## Popup and full settings

- [ ] Test global, current-site, click, trail, continuous-trail, and preview controls.
- [ ] Test Close to original, Light background, Soft, Power-saving, and Custom effect-preset states in both the popup and Full settings.
- [ ] Test the four effect presets and confirm their render mode, DPR, and compositing values persist in the popup and Full settings.
- [ ] Select experimental WebGPU HDR and confirm its six presentation controls become enabled and persist; confirm they are disabled in other modes. Treat Standard output as SDR and do not require HDR hardware for this test.
- [ ] Test Full WebGL2, explicit Software Bloom, and the other compatibility render modes, maximum DPR, output/isolated compositing, light-background contrast, click/trail timing, and all 66 public upstream Schema controls.
- [ ] Reset visual settings and confirm every advanced value returns to the extension defaults while website rules remain intact.
- [ ] Test system, Simplified Chinese, and English language modes.
- [ ] Test system, full, and reduced continuous-motion modes.
- [ ] Disable `https://example.com`, confirm the Canvas is removed, then restore the site rule.
- [ ] Confirm visual settings persist through a Firefox restart when installed through a persistent test profile or signed build.
- [ ] Confirm local website rules remain in `storage.local`, storage schema v5 does not duplicate or delete rules, and effect-parameter Schema 0 or Schema 1 migrates atomically to Schema 2.
- [ ] Confirm the repository, privacy, support, and demo links open the expected HTTPS pages.

## Restrictions and optional checks

- [ ] Confirm `about:` pages, addons.mozilla.org, and built-in PDF pages show a clear unsupported/not-loaded state.
- [ ] Optionally grant local-file access and test a local HTML page.
- [ ] Confirm local-file access is not required for the primary HTTP/HTTPS test.
- [ ] In `about:addons`, confirm the permissions and the no-data-collection declaration are consistent with the submitted documentation.

Record the Firefox version, operating system, test date, and any deviations in the release checklist before publishing.
