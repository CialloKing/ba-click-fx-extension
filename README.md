# CialloKing/ba-click-fx-extension Star history data

This orphan branch is maintained by GitHub Actions.

- `stars.csv` stores Star-count history by Asia/Shanghai calendar date.
- `star-history.svg` is generated deterministically from the CSV data.
- GitHub Actions updates the repository Star count once per day.
- CSV columns: `date,stars,source,observed_at`.
- `reconstructed` rows use the current stargazers' timestamps and cannot recover removed Stars.
- `observed` rows record the actual repository count with an ISO observation timestamp.
- Missed observation dates remain absent; no interpolated snapshots are inserted.
- Generated text uses UTF-8 with BOM and LF line endings.

Generated files should not be edited manually.
