# Data and Permission Inventory

This inventory is the source of truth for privacy-policy and store-dashboard answers.

| Information or capability | Where used | Persistence | Transmission | Purpose |
| --- | --- | --- | --- | --- |
| Pointer coordinates and pointer events | `ba-click-fx` runtime in `content.js` | Memory only; discarded as effects expire | None | Draw click rings, particles, and cursor trails |
| Current webpage URL/origin | `getSiteKey(window.location.href)` and popup active-tab lookup | Not persisted by merely visiting/opening the popup | None | Determine and display the current-site enable state |
| Explicitly disabled website origins | `disabledSites` in shared settings | Browser `storage.sync` until re-enabled/reset/uninstalled | Browser-vendor sync only when enabled | Remember site-specific disable choices |
| Enabled states, color, opacity, scale, quality | Popup and shared settings | Browser `storage.sync` until changed/reset/uninstalled | Browser-vendor sync only when enabled | Apply the user's visual and performance preferences |
| Webpage text, forms, cookies, passwords, communications, account/payment data | Not used | None | None | Not applicable |

## Network inventory

- Runtime `fetch`, XHR, WebSocket, EventSource, beacon, and remote-script calls: none.
- Developer-operated backend: none.
- Analytics, crash reporting, telemetry, ads, or tracking pixels: none.
- Remote code, `eval`, or `new Function`: none.

## Permission mapping

- `storage`: required for visual settings and explicit site rules.
- `activeTab`: required only when the user opens the popup to identify/message the active tab.
- HTTP/HTTPS content-script matches: required to render the extension's single purpose on ordinary webpages.
- `file:///*`: optional user-enabled support for local HTML pages.

## Dashboard classification

The conservative Chrome/Edge disclosure classifies the current/site-rule origins as web browsing activity and pointer events as user activity. Both are processed only for the user-facing feature, are not available to the developer, and are not used for analytics or profiling.
