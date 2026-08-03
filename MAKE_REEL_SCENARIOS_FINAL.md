# Make Reel Scenarios Final

## Scope

These are new, Reel-only scenarios. Do not alter the existing Telegram Collector, Cover Generator, carousel scenarios, or feed/carousel Publisher routes. The Instagram Reel route remains disabled until supervised acceptance tests pass.

Importable blueprint JSON is intentionally not generated: reliable Make imports require the live Airtable field IDs, connection IDs, Telegram connection, Instagram connection, Engine public HTTPS URL, and webhook configuration. Placeholder IDs would be unsafe and misleading. The following is an exact build specification.

## 1. Reel Brief Generator

**Trigger:** scheduled/manual run; searches `Content` view `Reel Brief Ready`, max 1.

1. Airtable Search Content: `Post Type = Reel`, `Reel Production Status = Brief Ready`.
2. Airtable Get linked Content Bundle and Bundle Media, ordered by existing media order/created time.
3. Build full bundle manifest: text, transcript, media metadata/references, project context.
4. OpenAI structured response: content angle, duration, narration strategy, Reel topic/hook/script/voice-over/caption/CTA/hashtags and typed scene briefs. No media-generation call.
5. Validate required keys and source media references.
6. Airtable Create `Media Scenes` records one per scene, with `Scene Approval Status = Draft`, `Scene Production Status = Not Queued`.
7. Airtable Update Content: write editorial fields, increment `Reel Brief Version`, set `Reel Production Status = Scenes In Review`, set `Reel Approval Status = Not Requested`.
8. On error: set `Reel Production Status = Production Failed` and `Reel Production Error`; do not create partial scenes.

**Idempotency key:** `brief:{Content Record ID}:{Reel Brief Version}`. Before creating scenes, search `Media Scenes` for the same Content/version; if found, stop without creating duplicates.

## 2. Reel Production Starter

**Trigger:** scheduled/manual run; searches `Content` view `Reel Production Queue`, max 1.

1. Airtable Get Content and linked approved Media Scenes, source Bundle Media, and Media Assets.
2. Guard: Post Type Reel; Reel Production Status Scenes Approved; Reel Approval Status Not Requested/Invalidated; Final Reel Asset blank.
3. Build `start_production` JSON precisely as `MAKE_TO_MEDIA_ENGINE_CONTRACT.md` specifies.
4. Idempotency key: `reel:{Content Record ID}:scene-version:{max approved Scene Version}:instagram_reel_9x16`.
5. HTTP POST to Engine public HTTPS `/v1/productions`, with `Authorization: Bearer <Make secret>` and bounded request timeout.
6. On 201/200, update Content `Reel Production Request ID`, `Reel Production Run ID`, `Reel Production Status = Queued`, clear `Reel Production Error`.
7. Error handler: set `Reel Production Status = Production Failed` plus concise error; never recreate Scenes/Bundle.

## 3. Media Engine Callback Handler

**Trigger:** Make custom webhook; URL is configured as Engine's authenticated callback URL.

1. Verify Bearer callback token and HMAC/timestamp signature before Airtable work.
2. Deduplicate on `event_id` using `Production Runs.Callback Event ID`; if already recorded, return 200 and perform no side effects.
3. Locate Content by `content_id` and Production Run by `production_run_id`.
4. Update Production Run and Content exactly according to event type:
   - `run_queued` -> Content `Queued`.
   - `narration_ready` -> `Narration Asset` and `Narration Ready`.
   - `final_render_ready` -> `Final Reel Asset`, `Subtitle Asset`, duration/validation summary, `Approval Required`, `Reel Approval Status = Pending Approval`.
   - `validation_failed`/`run_failed` -> `Production Failed` + concise error.
   - `approval_invalidated` -> clear approval fields; `Reel Approval Status = Invalidated`.
5. Return 200 only after the event is recorded.

## 4. Telegram Reel Preview and Approval Handler

**Trigger:** a Content record enters `Approval Required`, plus Telegram callback-query updates.

1. Send the Final Reel preview link/file with exact Content record ID encoded in signed callback data.
2. Present two actions: `Approve Reel` and `Request Revision`.
3. On approval: verify authorized user; update Content `Reel Approval Status = Approved`, `Reel Approved At`, `Reel Approved By`, `Reel Production Status = Approved for Publishing`; call Engine `set_approval` command when enabled.
4. On revision: set `Reel Approval Status = Revision Requested`, `Reel Production Status = Brief Ready`; do not delete prior assets/runs.
5. Answer Telegram callback query once; deduplicate Telegram callback/update ID.

## 5. Instagram Publisher Reel Route

**Initial state: disabled.** Add it as a new router branch without changing existing feed/carousel routes.

1. Search view `Reels Approved for Publishing` for max one due record.
2. Guard: Post Type Reel; Reel Production Status Approved for Publishing; Final Reel Asset exists; Instagram Reel ID blank; approval timestamp exists.
3. Call Instagram Business Reel/media API using only `Final Reel Asset` and final caption.
4. Persist provider post ID/permalink/published time.
5. Set Content `Reel Production Status = Published`; only then set existing general status to `Posted` if the current operating policy requires it.
6. Error handler records error and leaves Reel in `Approved for Publishing` for a controlled retry.

## Shared Make safeguards

- One record per scenario execution (`maxRecords = 1`) until monitored production concurrency is approved.
- Never create Content Bundles or Bundle Media in these scenarios.
- Never create a second Scene set for a matching brief idempotency key.
- Use Make connection/secret storage for Engine and callback secrets.
- Log run/request/event IDs to Airtable; never store raw authorization headers.
