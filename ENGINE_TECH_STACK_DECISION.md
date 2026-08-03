# Engine Technology Stack Decision

## Selected stack

- **Runtime:** Node.js 24, using native ES modules and the built-in `node:test` runner.
- **HTTP API:** Node's built-in `node:http` server.
- **Validation:** small explicit runtime validators at the API boundary; no unvalidated commands enter production services.
- **Job persistence:** JSON files in an engine-local data directory for local development; the repository interface permits a later database/server implementation.
- **Media processing:** project-local FFmpeg executable invoked by the rendering worker.
- **Logging:** structured JSON lines written to the engine-local logs directory and returned through the status API.
- **Provider design:** adapter interfaces with a Mock TTS implementation only. No real TTS, image, video, storage, or publishing provider is selected or connected.

## Why this stack

This is deliberately lightweight for the MVP: it is easy to run on Windows, has no global installation requirement beyond Node and a project-local FFmpeg path, and keeps the implementation portable to a Windows service, Linux server, container, or worker process later. The HTTP and model boundaries are explicit so the native local development implementation can be swapped for a framework/database without changing the Make contract or media scene model.

The engine is isolated in `media-production-engine/`. It has no dependency on existing Make blueprints, Airtable schemas, Telegram logic, or publishing modules.

## Deliberate non-selections

- No real TTS provider.
- No AI image/video-generation provider.
- No cloud storage provider.
- No database server.
- No Make, Airtable, Telegram, or Instagram API client.
- No frontend or background-queue service beyond the local file-backed job runner.

These exclusions keep the MVP reversible and prevent external side effects.
