# Make Integration Next Step

Do not apply this step until the local engine is approved.

The future Make integration is limited to a new Reel production scenario family. It must not modify the existing Telegram Collector, Content Bundle creation logic, Cover Generator, carousel fields, or existing feed/carousel publisher routes.

## Future sequence

1. Make detects a manually selected/approved Reel Content record and sends a `start_production` command to the engine with stable content/bundle IDs, scene version, and idempotency key.
2. The engine returns/callbacks a stable production run ID and status events.
3. Make updates only additive Reel production fields and sends the Telegram preview after a validated final-render callback.
4. Telegram approval updates the Reel approval status.
5. A new isolated Reel route in the existing Instagram Publisher consumes only an approved Final Reel and saves its publication receipt.

Use the exact command/callback formats in `MAKE_TO_MEDIA_ENGINE_CONTRACT.md`. Keep engine authentication secrets in Make connections/secret storage, never in mapper text.
