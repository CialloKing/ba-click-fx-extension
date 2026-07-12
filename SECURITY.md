# Security Policy

## Supported versions

Security fixes are applied to the latest published version of BA Click FX Extension.

## Reporting a vulnerability

Please do not include secrets, personal data, exploit payloads, or private browsing information in a public issue.

For an ordinary bug that does not expose users or data, open a GitHub issue:

https://github.com/CialloKing/ba-click-fx-extension/issues

For a vulnerability that could put users at risk, use GitHub's private vulnerability reporting feature on the repository Security tab. Include the affected version, reproduction steps, impact, and any suggested mitigation.

The maintainer will acknowledge a valid report as soon as practical, investigate it, and coordinate a fix and disclosure timeline based on severity.

## Scope

Security-sensitive areas include:

- extension permissions and content-script isolation;
- storage of visual and site-specific preferences;
- build and release integrity;
- remote-code or dependency supply-chain risks; and
- interactions with arbitrary webpages.
