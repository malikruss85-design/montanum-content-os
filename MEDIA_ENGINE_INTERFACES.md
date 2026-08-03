# Media Engine Interfaces

## Principles

All providers are optional, replaceable adapters behind stable engine contracts. Provider credentials remain inside the adapter configuration. Make and Airtable use engine request IDs and asset references, never vendor-specific credentials or temporary job payloads.

## Shared adapter result

```json
{
  "request_id": "stable-engine-request-id",
  "status": "queued|running|succeeded|failed",
  "provider_job_id": "provider-reference-or-null",
  "output_assets": [],
  "error": { "code": "", "message": "", "retryable": true }
}
```

## TTS adapter

**Purpose:** create narration from an approved voice-over script.

```text
synthesize(request_id, text, language, voice_profile, output_spec) -> AdapterResult
get_status(request_id | provider_job_id) -> AdapterResult
```

The output asset includes storage reference, duration, sample rate, loudness metadata, and checksum. MVP requires one narration track only.

## Image-generation adapter (future interface only)

**Purpose:** create an image when a Scene explicitly has approved generation requirement/prompt.

```text
generate_image(request_id, prompt, references, output_spec) -> AdapterResult
get_status(request_id | provider_job_id) -> AdapterResult
```

This interface is not invoked in the MVP.

## Video-generation adapter (future interface only)

**Purpose:** create a motion/video asset from approved inputs when a Scene explicitly allows it.

```text
generate_video(request_id, prompt, references, duration, output_spec) -> AdapterResult
get_status(request_id | provider_job_id) -> AdapterResult
```

This interface is not invoked in the MVP.

## Storage adapter

**Purpose:** store source/output assets and produce durable object references.

```text
put(request_id, input_stream_or_url, metadata) -> AssetReference
get(asset_id) -> readable source
create_preview(asset_id, expiry_policy) -> preview reference
verify(asset_id, expected_checksum) -> verification result
```

Storage references are durable object keys/URIs; the adapter may issue temporary preview/download URLs separately.

## Rendering worker adapter

**Purpose:** execute deterministic scene and final timeline rendering.

```text
render_scene(request_id, scene_spec, source_assets, output_spec) -> AdapterResult
render_timeline(request_id, timeline_spec, source_assets, audio_assets, subtitle_asset, output_spec) -> AdapterResult
validate_render(request_id, final_asset, validation_spec) -> AdapterResult
get_status(request_id | worker_job_id) -> AdapterResult
cancel(request_id | worker_job_id) -> AdapterResult
```

The implementation may use local workers, containers, managed jobs, or a rendering API later. The engine must not depend on one choice.

## Subtitle interface

**Purpose:** generate timed subtitle file and a render-ready subtitle track from final narration and scene segments.

```text
create_subtitles(request_id, narration_asset, scene_voice_segments, language, style) -> AdapterResult
```

MVP output includes a timed subtitle file and a burned-in rendering instruction. Any transcription/alignment provider remains an internal adapter dependency.

## Provider polling and retry policy

1. Engine accepts a command once using the request ID and records a run before calling a provider.
2. Adapter job IDs are saved on the run; polling reads those IDs rather than submitting again.
3. A repeated command with the same input signature returns the prior succeeded result or current job state.
4. Retryable failures use bounded backoff and retain run history; non-retryable failures require operator intervention.
5. A changed scene/brief/assets/configuration creates a new input signature and production run.

## Rendering profile contract

Profiles keep channels extensible without changing scene or asset entities.

```json
{
  "profile_id": "instagram_reel_9x16",
  "width": 1080,
  "height": 1920,
  "aspect_ratio": "9:16",
  "container": "mp4",
  "subtitle_mode": "burned_in",
  "audio_tracks": 1
}
```

Future LinkedIn, YouTube Shorts, TikTok, drone footage, construction timelapse, project-progress, and presentation-film profiles are new configuration values, not new architecture branches.
