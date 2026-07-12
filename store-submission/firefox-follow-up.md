# Firefox / AMO Follow-up

Firefox is intentionally outside the `1.0.2` Chromium store package. Do not upload the Chromium ZIP to AMO without completing and testing a separate build.

Required follow-up work:

- create a Firefox-specific Manifest without `minimum_chrome_version`;
- add a stable Gecko extension ID and supported minimum Firefox version;
- add the current AMO `data_collection_permissions` declaration, including an explicit `none` declaration if applicable;
- verify `chrome.storage.sync`, active-tab messaging, locale fallback, closed Shadow DOM, and pointer behavior in Firefox;
- run `web-ext lint` against the Firefox distribution;
- create a Firefox-specific ZIP and source-code package if requested by AMO;
- test signing and self-distribution rules; and
- prepare AMO-specific privacy answers and screenshots.

Track this as a separate release so Chromium and Firefox review artifacts remain unambiguous.
