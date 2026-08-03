# Make to Media Engine Contract

## Responsibility split

| Make | Media Production Engine |
| --- | --- |
| Airtable triggers and status changes | TTS, audio processing, subtitles, rendering, polling, retry logic |
| Authenticated webhook command delivery | Scene timing, trimming, cropping, effects, transitions, intro/outro, mix and final assembly |
| Telegram preview / approval messages | Output validation, asset provenance, durable production logs |
| Approval state update | Provider adapters and storage |
| Existing Instagram publishing handoff | Provider job management |

Make must not embed source-media transformation code, long-polling loops, provider credentials, or an alternate media data model.

## Commands from Make

### Create/refresh a production plan

```json
{
  "command": "plan_production",
  "idempotency_key": "content-id:brief-version",
  "content_id": "Airtable Content record ID",
  "bundle_id": "Airtable Content Bundle record ID",
  "target_profile": "instagram_reel_9x16",
  "callback": { "type": "webhook", "reference": "Make callback token" }
}
```

### Start approved production

```json
{
  "command": "start_production",
  "idempotency_key": "content-id:scene-version:profile",
  "content_id": "Airtable Content record ID",
  "scene_version": 1,
  "target_profile": "instagram_reel_9x16",
  "preview_required": true,
  "callback": { "type": "webhook", "reference": "Make callback token" }
}
```

### Request retry

```json
{
  "command": "retry_run",
  "idempotency_key": "existing-run-id:retry-number",
  "production_run_id": "stable engine run ID",
  "callback": { "type": "webhook", "reference": "Make callback token" }
}
```

### Confirm approval / invalidate approval

```json
{
  "command": "set_approval",
  "idempotency_key": "content-id:final-asset-id:approval-action",
  "content_id": "Airtable Content record ID",
  "final_asset_id": "Media Asset ID",
  "action": "approve|request_revision",
  "actor_reference": "Telegram/Airtable user reference"
}
```

## Callback events to Make

```json
{
  "event_id": "stable-event-id",
  "event_type": "run_queued|narration_ready|scene_rendered|final_render_ready|validation_failed|run_failed|approval_invalidated",
  "production_run_id": "stable engine run ID",
  "content_id": "Airtable Content record ID",
  "status": "",
  "output_assets": [
    { "asset_id": "", "asset_class": "narration|subtitle|final_publication", "preview_url": "", "storage_reference": "" }
  ],
  "error": { "code": "", "message": "", "retryable": false },
  "occurred_at": "ISO-8601 timestamp"
}
```

Make records the event, updates the concise Reel production fields on the target Content record, and sends preview/approval notification only for a validated `final_render_ready` event.

## Authentication and verification

- Commands and callbacks use authenticated HTTPS requests with rotating secrets kept in Make connections/secret storage and engine secret storage.
- Every callback is verified using signature/timestamp or an equivalent replay-safe mechanism.
- `event_id` is deduplicated by Make before Airtable/Telegram side effects.
- `idempotency_key` is passed unchanged from Make to the engine and stored with the run.
- No API key, provider secret, private source URL, or raw Telegram token is included in Airtable error fields or Telegram messages.

## Airtable status mapping

| Engine event | Operator-facing Content field update |
| --- | --- |
| run_queued | Reel Production Status = Queued |
| narration_ready | Narration attached; status = Narration Ready |
| final_render_ready | Final Reel + Subtitle File attached; status = Approval Required |
| validation_failed / run_failed | status = Production Failed; concise error summary set |
| approval_invalidated | status = Brief Ready or Preview Ready as appropriate; previous approval cleared |

The existing Publisher gets a Reel handoff only when: Post Type is Reel, the status is Approved for Publishing, a validated Final Reel is present, and no Instagram Reel receipt exists.
