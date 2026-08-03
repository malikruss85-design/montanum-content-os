# Engine Changelog

## 2026-08-03 - Reel Brief Generator media-manifest fix

- Corrected the live Make `Reel Brief Generator` prompt mapping from the nonexistent Array Aggregator field `4.media` to `4.Array[]`.
- Verified from the saved module configuration that the OpenAI prompt now receives the complete Bundle Media array. No Telegram, calendar, carousel, or publishing scenario was changed.

## 2026-08-03 - Reel Brief Generator integration package

- Added strict Project Showcase Reel Brief JSON schema and representative input/output samples.
- Added a dedicated prompt constrained to Bundle/Project facts and actual Bundle Media IDs.
- Added module map, filters, error handling, field mapping, and test checklist for the new Make-only Reel Brief Generator scenario.
- Extended the written additive Airtable schema with missing non-duplicative brief fields and a durable `Reel Brief Idempotency Key`.
- No engine API contract, renderer code, Make scenario, Airtable base, Telegram Collector, publisher, or provider connection was changed.
