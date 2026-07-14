# Changelog

All notable changes to BA Click FX Extension are documented in this file.

## [Unreleased]

## [1.0.6] - 2026-07-14

### Added

- Dedicated Firefox Manifest V3 build with a stable Gecko ID and an explicit no-data-collection declaration for AMO.
- Deterministic Firefox submission ZIP, reviewer-rebuildable Firefox source ZIP, and combined SHA-256 inventory.
- `web-ext` lint as a zero-warning Firefox release gate.
- Firefox runtime checklist, AMO listing copy, privacy answers, permission explanations, reviewer notes, and manual submission instructions.
- Refreshed English and Simplified Chinese store screenshots for the current popup, site control, and full settings page.

### Changed

- Split the shared Manifest from small Chromium and Firefox target overlays while retaining one content, popup, options, storage, and localization codebase.
- Extended CI, release validation, and GitHub Release assets to cover Chromium, Firefox, and Firefox source packages.
- Set Firefox Desktop 140 and Firefox for Android 142 as the declared minimum versions required by Mozilla's built-in data collection permission manifest field. The prepared AMO listing targets Firefox Desktop only.

### Compatibility

- User settings remain on storage schema v2, and the popup/content message protocol remains v2.
- Chromium permissions, host matches, minimum Chrome/Edge version, bundled core `ba-click-fx 1.1.11`, and visible runtime behavior are unchanged.

## [1.0.5] - 2026-07-14

### Added

- Dedicated options page for appearance presets, quality, language, motion preferences, local website-rule management, privacy, support, and project links.
- Classic, Soft, and Power-saving appearance presets with an explicit Custom state.
- System, Simplified Chinese, and English interface-language choices.
- System, full-motion, and reduced-motion choices; reduced motion preserves click effects while suppressing the continuous moving trail.
- Storage schema v2 migration, local site-rule search/removal/clear controls, and an explicit legacy synced-rule cleanup action.
- Version/tag/changelog validation for GitHub releases.

### Changed

- Upgraded `ba-click-fx` from `1.1.6` to `1.1.11`.
- Replaced private upstream state and trail workarounds with the public trail lifecycle API.
- Replaced estimated DPR limiting with the core package's total backing-store pixel budget.
- Moved explicitly disabled website origins from `storage.sync` to `storage.local`; visual preferences remain in browser-provided sync storage.
- Simplified the popup around global, current-site, click, trail, preview, and full-settings actions.
- Added structured content-script readiness and update status reporting.
- Stopped tracking generated `dist` files; CI and Release workflows now build and upload artifacts.
- Raised the development runtime requirement to Node.js 22.

### Migration

- Existing synced website rules are merged into local storage idempotently on first v1.0.5 use.
- The old synced copy is retained to protect other devices that have not updated. Users may remove it explicitly from the options page after every device has upgraded.
- `v1.0.4` was intentionally skipped; its planned reliability and release improvements are included in `v1.0.5`.

## [1.0.2] - 2026-07-12

### Added

- English and Simplified Chinese extension localization.
- Store submission copy, reviewer notes, privacy disclosures, and release checklist.
- Public privacy policy, support links, and store URL inventory.
- Chrome/Edge promotional assets and localized screenshots.
- Cross-platform Chromium ZIP packaging and store-asset validation.

### Changed

- Upgraded `ba-click-fx` to `1.1.6`.
- Added an in-product disclosure for site-specific origin storage.
- Changed the default locale to Simplified Chinese; non-Chinese browser languages use English and detection failures fall back to Chinese.
- Added a project-repository link to the extension popup.

## [1.0.1] - 2026-07-11

### Changed

- Upgraded `ba-click-fx` to `1.1.5`.
- Published the first tagged Chromium release.

## [1.0.0] - 2026-07-11

### Added

- Manifest V3 content script with click rings, particles, and cursor trails.
- Global and per-site controls.
- Color, opacity, scale, and quality settings.
- Closed Shadow DOM Canvas isolation and background-tab resource release.
- UTF-8 BOM and LF validation for project text files.
