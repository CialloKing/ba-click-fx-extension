# Data and Permission Inventory

This inventory is the source of truth for privacy-policy and store-dashboard answers.

| Information or capability | Where used | Persistence | Transmission | Purpose |
| --- | --- | --- | --- | --- |
| Pointer coordinates and pointer events | `ba-click-fx` runtime in `content.js` | Memory only; discarded as effects expire | None | Draw click rings, particles, and cursor trails |
| Current webpage URL/origin | `getSiteKey(window.location.href)` and popup active-tab lookup | Not persisted by merely visiting/opening the popup | None | Determine and display the current-site enable state |
| Explicitly disabled website origins | `disabledSites` in shared settings | Browser `storage.local` until re-enabled/removed/cleared/uninstalled | None since v1.0.5 | Remember site-specific disable choices on the current browser profile |
| Legacy explicitly disabled origins | Pre-v1.0.5 `disabledSites` migration | Existing browser `storage.sync` copy is retained until explicit options-page cleanup | Browser-vendor sync only when enabled | Prevent another device that has not updated from losing its existing rules |
| Enabled states, color, opacity, scale, quality, preset, language, motion | Popup/options/shared settings | Browser `storage.sync` until changed/reset/uninstalled | Browser-vendor sync only when enabled | Apply the user's visual, performance, interface, and accessibility preferences |
| Webpage text, forms, cookies, passwords, communications, account/payment data | Not used | None | None | Not applicable |

## Network inventory

- Runtime `fetch`, XHR, WebSocket, EventSource, beacon, and remote-script calls: none.
- Developer-operated backend: none.
- Analytics, crash reporting, telemetry, ads, or tracking pixels: none.
- Remote code, `eval`, or `new Function`: none.

## Permission mapping

- `storage`: required for synced visual/interface preferences, local site rules, and the one-time schema migration.
- `activeTab`: required only when the user opens the popup to identify/message the active tab.
- HTTP/HTTPS content-script matches: required to render the extension's single purpose on ordinary webpages.
- `file:///*`: optional user-enabled support for local HTML pages.

## Dashboard classification

The conservative Chrome/Edge disclosure classifies the current/site-rule origins as web browsing activity and pointer events as user activity. Both are processed only for the user-facing feature, are not available to the developer, and are not used for analytics or profiling.

Firefox/AMO classifies collection or transmission outside the add-on or local browser boundary. Because every value above remains in memory or browser-provided extension storage and no runtime network request exists, the Firefox Manifest declares `data_collection_permissions.required: ["none"]`. Do not copy the Chrome/Edge local-processing categories into the AMO no-transmission field.
