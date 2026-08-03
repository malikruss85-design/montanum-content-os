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

### Start production (implemented endpoint)

```json
{
  "command": "start_production",
  "idempotencyKey": "content-id:scene-version:profile",
  "contentId": "Airtable Content record ID",
  "bundleId": "Airtable Content Bundle record ID",
  "renderingProfile": { "profileId": "instagram_reel_9x16", "width": 1080, "height": 1920, "aspectRatio": "9:16" },
  "voiceOverScript": "English narration produced by the Reel brief",
  "subtitleText": "English subtitles",
  "scenes": [
    { "sceneId": "Airtable Media Scene record ID", "sequence": 1, "sourceAssetId": "Airtable Bundle Media record ID", "sourceAssetType": "original_video", "sourcePath": "provider-approved local path or signed asset URL", "trimStart": 0, "trimEnd": 5, "outputAspectRatio": "9:16", "fitMode": "cover" }
  ]
}
```

The current engine exposes `POST /v1/productions` for this command and `POST /v1/productions/{runId}/invalidate-approval` for a scene change. Planning, retry and operator approval are handled by Make/Airtable in this phase.

## Callback events to Make

```json
{
  "eventId": "stable-event-id",
  "eventType": "run_queued|narration_ready|final_render_ready|run_failed",
  "productionRunId": "stable engine run ID",
  "contentId": "Airtable Content record ID",
  "status": "",
  "outputAssets": [
    { "assetId": "", "assetClass": "narration|subtitle|final_publication", "downloadUrl": "authenticated engine URL" }
  ],
  "error": { "code": "", "message": "", "retryable": false },
  "occurredAt": "ISO-8601 timestamp"
}
```

Make downloads `downloadUrl` with the Engine bearer token, uploads the resulting file through the existing media-storage connection, then records the durable URL in Airtable. It sends preview/approval notification only for a validated `final_render_ready` event.

## Authentication and verification

- Commands and callbacks use authenticated HTTPS requests with rotating secrets kept in Make connections/secret storage and engine secret storage.
- Every callback is verified using signature/timestamp or an equivalent replay-safe mechanism.
- `eventId` is deduplicated by Make before Airtable/Telegram side effects.
- `idempotencyKey` is passed unchanged from Make to the engine and stored with the run.
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
