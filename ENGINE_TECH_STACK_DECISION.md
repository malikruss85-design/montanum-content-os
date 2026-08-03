# Engine Technology Stack Decision

## Selected stack

- **Runtime:** Node.js 24, using native ES modules and the built-in `node:test` runner.
- **HTTP API:** Node's built-in `node:http` server.
- **Validation:** small explicit runtime validators at the API boundary; no unvalidated commands enter production services.
- **Job persistence:** JSON files in an engine-local data directory for local development; the repository interface permits a later database/server implementation.
- **Production media processing:** Cloudinary video transformations, using the existing Make Cloudinary connection.
- **Optional fallback:** project-local FFmpeg executable invoked by the isolated renderer for local, controlled tests or future compositions that Cloudinary cannot express.
- **Logging:** structured JSON lines written to the engine-local logs directory and returned through the status API.
- **Voice provider:** OpenAI TTS (`gpt-4o-mini-tts`) selected for the first English voice. Its Make connection already exists; the API key remains outside the repository.

## Why this stack

This keeps the production MVP inside services already used by the Content OS: Make orchestrates, Cloudinary stores and transforms, Airtable remains the approval control surface, and OpenAI creates the English narration. The isolated Node/FFmpeg implementation is retained as a local testable fallback, not a service to deploy.

The engine is isolated in `media-production-engine/`. It has no dependency on existing Make blueprints, Airtable schemas, Telegram logic, or publishing modules.

## Deliberate non-selections

- No new hosting provider or Render service.
- No AI image/video-generation provider.
- No new cloud-storage provider; Cloudinary is the selected media store and transformation provider.
- No database server.
- No Make, Airtable, Telegram, or Instagram API client.
- No frontend or background-queue service beyond the local file-backed job runner.

These exclusions keep the MVP reversible and prevent external side effects.
