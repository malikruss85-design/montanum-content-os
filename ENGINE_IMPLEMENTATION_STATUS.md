# Engine Implementation Status

## Completed local Reel-production work

- Isolated `media-production-engine/` service with authenticated HTTP API, stable run/asset IDs, idempotency, local run persistence and structured logs.
- Validated `start_production` command with ordered 9:16 scenes, English voice-over script and subtitle text.
- OpenAI TTS adapter for `gpt-4o-mini-tts` with configurable English voice; Mock TTS remains available only for local tests.
- FFmpeg Reel renderer: source video trims, still-image holds, 1080×1920 crop/fit, AAC narration, burned-in subtitles and output validation.
- Secure source-media resolver for existing Cloudinary HTTPS URLs. It accepts only configured hosts, enforces media type/size/time limits and stores source inputs in the persistent run directory.
- Authenticated `GET`/`HEAD /v1/assets/{assetId}` endpoint so Make can download a final MP4, narration or subtitle asset without exposing an internal filesystem path.
- Signed Make callbacks for queued, narration-ready, final-render-ready and run-failed events, including retry for temporary delivery failures and authenticated `downloadUrl` values.
- Dockerfile, Compose configuration, persistent local storage, readiness checks, graceful shutdown and production secret configuration for an optional local fallback renderer.

## Intentionally not enabled yet

- Production Reel assembly now uses the existing Make Cloudinary connection rather than a Render-hosted service. The exact Make module sequence and Cloudinary asset contract are in `CLOUDINARY_REEL_ASSEMBLY.md`.
- A separate, disabled Make scenario, `Reel Production — Cloudinary Assembly` (`6806011`), now persists the safe preparation segment: Airtable eligible-Reel search → OpenAI `gpt-4o-mini-tts` with voice `coral` → Cloudinary MP3 upload under a deterministic public ID → Content update with narration URL and `Narration Ready` → Bundle Media lookup → parse full `Scene Plan JSON` → iterate scenes → read each referenced Bundle Media record. It has not been run, enabled, or connected to Telegram/Instagram.
- Remaining live Make work is the explicit Bundle-membership filter, source-scene aggregation, SRT upload, final Cloudinary transformation, preview update and one controlled acceptance run. Existing collector, approval and publisher routes stay unchanged until a final Cloudinary MP4 is acceptance-tested.
- Direct or automatic Instagram publication, generated images/video, advanced transitions, music and additional channels.

## Verification state — 3 August 2026

- `node --test` with the project-local `ffmpeg-static` binary: 32 passed, 0 failed, 0 skipped.
- Tests cover real FFmpeg assembly of a 1080×1920 MP4 with audio and burned-in subtitles, a complete Cloudinary URL → download → render path, OpenAI request shape without a live API call, authenticated asset delivery, signed callback retry, idempotency and approval invalidation.
- A local server startup check passed for both `/health` and `/ready` using the project-local FFmpeg binary.
- Cloudinary URL planning tests verify transformed delivery-URL parsing, Brief-to-Bundle-Media joining, source type verification, ordered image/video splicing, narration and raw `.srt` subtitle layer construction without calling a paid provider.
- The `npm run plan:cloudinary` CLI smoke check generates a 9:16 final delivery URL and timed SRT from a photo/video fixture without a network call.
- Docker Desktop is not installed in this workspace, so the optional container fallback has not been run locally. No Render service or paid disk is created or required.
