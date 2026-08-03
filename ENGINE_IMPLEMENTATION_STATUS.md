# Engine Implementation Status

## Completed local Reel-production work

- Isolated `media-production-engine/` service with authenticated HTTP API, stable run/asset IDs, idempotency, local run persistence and structured logs.
- Validated `start_production` command with ordered 9:16 scenes, English voice-over script and subtitle text.
- OpenAI TTS adapter for `gpt-4o-mini-tts` with configurable English voice; Mock TTS remains available only for local tests.
- FFmpeg Reel renderer: source video trims, still-image holds, 1080×1920 crop/fit, AAC narration, burned-in subtitles and output validation.
- Secure source-media resolver for existing Cloudinary HTTPS URLs. It accepts only configured hosts, enforces media type/size/time limits and stores source inputs in the persistent run directory.
- Authenticated `GET`/`HEAD /v1/assets/{assetId}` endpoint so Make can download a final MP4, narration or subtitle asset without exposing an internal filesystem path.
- Signed Make callbacks for queued, narration-ready, final-render-ready and run-failed events, including retry for temporary delivery failures and authenticated `downloadUrl` values.
- Dockerfile, Compose configuration, Render Blueprint, persistent storage, readiness checks, graceful shutdown and production secret configuration.

## Intentionally not enabled yet

- Live Render deployment, OpenAI API key entry and Make callback secret configuration.
- Live Make/Airtable/Telegram/Instagram changes. The engine and exact contract are ready, but the existing scenarios remain untouched until the deployed endpoint exists.
- Direct or automatic Instagram publication, generated images/video, advanced transitions, music and additional channels.

## Verification state — 3 August 2026

- `node --test` with the project-local `ffmpeg-static` binary: 22 passed, 0 failed, 0 skipped.
- Tests cover real FFmpeg assembly of a 1080×1920 MP4 with audio and burned-in subtitles, a complete Cloudinary URL → download → render path, OpenAI request shape without a live API call, authenticated asset delivery, signed callback retry, idempotency and approval invalidation.
- A local server startup check passed for both `/health` and `/ready` using the project-local FFmpeg binary.
- Docker Desktop is not installed in this workspace, so the container itself has not been run locally. The Render Docker deployment is prepared but awaits user authentication and secret entry.
