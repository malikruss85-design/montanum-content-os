# Airtable Field Creation Checklist

Perform only after integration approval and a base backup/export.

1. In `Content`, create the additive Reel fields in the exact order/names in `AIRTABLE_REEL_SCHEMA_FINAL.md`, including the idempotency and brief-audit fields; do not modify current fields.
2. Create `Media Assets` and its primary field `Asset ID`; add all fields except `Scene` and `Production Run` first.
3. Create `Production Runs` with primary field `Production Run ID`; add all fields except `Output Assets` first.
4. Create `Media Scenes` with primary field `Scene ID`; add all non-link/select fields first.
5. Create links from `Media Scenes` to `Content`, `Media Assets`, and existing `Bundle Media`.
6. Create links from `Media Assets` to `Content`, `Media Scenes`, `Production Runs`, and existing `Bundle Media`.
7. Create `Production Runs` links to `Content` and `Media Assets`.
8. Create the three new `Content` links: `Media Scenes`, `Media Assets`, `Production Runs`; Airtable will create inverse fields automatically. Rename inverse fields only if they do not conflict with this specification.
9. Configure exact select values and colours; do not use alternate spellings/capitalization.
10. Create views from `AIRTABLE_VIEWS_AND_FILTERS.md`.
11. Create one test Reel record manually. Confirm no existing carousel/feed record changes and no existing automation fires.
12. Export the new schema and record IDs/field IDs for future Make mapping.
