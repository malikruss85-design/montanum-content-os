# Montanum - Reel Brief Generator: Filters

## Source Bundle selection

Use an explicit Airtable formula adapted to actual field IDs after the additive schema exists:

```text
AND(
  {Status} = "Ready",
  {Bundle Media} != ""
)
```

Sort by `Created Time` ascending and select one record. This does not modify Bundle status and preserves Collector logic.

## Target Content duplicate lookup

```text
{Reel Brief Idempotency Key} = "{{computed_idempotency_key}}"
```

The key is exact, case-sensitive operational data:

```text
brief:{{Bundle Airtable record ID}}:project_showcase:{{Reel Brief Version}}
```

## Target-create filter

Create a Content record only when the duplicate lookup has no record.

## Project retrieval filter

Retrieve `Projects` only when the source Bundle's existing `Project` linked record is nonempty. Do not infer or create a Project.

## Valid-input filter

Proceed to GPT only if at least one is true:

```text
Bundle Media count > 0
OR User Message is not empty
OR Voice Transcript is not empty
```

## Scene-source validation filter

For every GPT scene:

```text
source_bundle_media_id exists
AND exact matching Bundle Media record belongs to the selected Bundle
AND source_asset_type is Original Video, Original Photo, or Render
```

`Generated Image`, `Generated Video`, `Drone`, and `Timelapse` are not valid GPT-generated values in this MVP unless the actual Bundle Media type/classification already supports them.

## Final commit filter

Update Content to `Scenes In Review` only if JSON parses, every scene source validates, scene durations are positive, total scene duration is between 20 and 40 seconds and does not exceed `target_duration_seconds`, and all Media Scene upserts succeeded.
