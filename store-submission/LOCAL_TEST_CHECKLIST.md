# Chrome and Edge Local Test Checklist

Record browser version, operating system, extension version, date, and tester for each run.

## Installation

- [ ] `dist` loads without Manifest errors.
- [ ] Name and description follow the browser UI language.
- [ ] Toolbar icon and popup render correctly.
- [ ] “Full settings” opens the options page and all project/privacy/support links work.
- [ ] No errors appear on the extension management page.

## Core behavior

- [ ] Clicking ordinary webpages displays a ring and particles.
- [ ] Pointer movement displays a smooth trail.
- [ ] Rapid clicking and dragging remain responsive.
- [ ] Links, buttons, text selection, forms, scrolling, and context menus are not blocked.
- [ ] A webpage's own `#sparkCanvas` is not reused or modified.

## Settings

- [ ] Global enable/disable applies immediately.
- [ ] Click and trail switches work independently.
- [ ] “Always show while moving” works as described.
- [ ] Color, opacity, size, all three quality modes, and Classic/Soft/Power-saving presets apply immediately.
- [ ] Current-site disable removes effects only for that origin.
- [ ] Re-enabling the site removes the saved rule.
- [ ] Website rules appear in the options page and search/remove/clear work with confirmation where required.
- [ ] Visual reset restores visual defaults without clearing local website rules.
- [ ] Interface language supports System, Simplified Chinese, and English.
- [ ] Reduced motion preserves click effects while suppressing the continuous moving trail; System follows an operating-system preference change.
- [ ] Settings survive popup close/reopen and browser restart.

## Upgrade migration

- [ ] A pre-1.0.5 `storage.sync.disabledSites` fixture is merged into `storage.local.disabledSites` exactly once.
- [ ] Existing local and legacy rules are merged without losing either set.
- [ ] The legacy sync copy remains until “Delete legacy sync copy” is explicitly confirmed.
- [ ] Deleting the legacy sync copy does not remove the migrated local rules.

## Lifecycle and performance

- [ ] Backgrounding and restoring the tab recreates effects without duplicate Canvas elements.
- [ ] Back/forward cache navigation restores effects.
- [ ] Single-page-app navigation does not create duplicate overlays.
- [ ] Resizing and moving between normal/high-DPI monitors remains usable.
- [ ] High quality on 2K/4K displays does not cause browser instability.
- [ ] Offline operation remains fully functional.

## Expected restrictions

- [ ] Browser internal pages and extension-store pages show no effect and the popup explains the restriction.
- [ ] File URLs work only after file access is explicitly enabled.
- [ ] Iframe-only pointer areas may not show effects, matching the listing limitation.

## Privacy and network

- [ ] Disabling a site displays the in-product origin-storage disclosure.
- [ ] DevTools Network shows no requests initiated by the extension.
- [ ] No page text, form value, cookie, or credential is accessed.
