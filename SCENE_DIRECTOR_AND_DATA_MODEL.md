# Scene Director and Data Model

## Role

The Scene Director converts an approved AI Content Director brief into separate, editable, typed Scene entities. A scene is never represented only by a single JSON field. Structured fields permit individual scene correction, regeneration, approval, and retry without rebuilding the entire Reel.

## Additive entities

These are proposed additions for a later approved implementation. They extend the existing Airtable core model; they do not alter or replace `Projects`, `Content Bundles`, `Bundle Media`, or `Content`.

| Entity | Relationship | Purpose |
| --- | --- | --- |
| Media Scenes | Many scenes belong to one existing Content record | Editable timeline instructions. |
| Media Assets | One asset may be used by many scenes/runs | Canonical source/derivative technical metadata and provenance. |
| Production Runs | One or more runs belong to one Content record | Idempotent production execution, retry, log, and output trace. |
| Production Events | Many events belong to a run | Optional detailed audit/retry history; can initially be engine-owned. |

## Media Scenes fields

| Field | Type | Meaning |
| --- | --- | --- |
| Scene ID | Immutable text/UUID | Stable scene identity. |
| Content | Linked record to existing Content | Parent Reel/editorial item. |
| Sequence | Integer | Timeline ordering; unique within Content version. |
| Source Asset | Link to Media Assets / Bundle Media reference | Selected visual source. |
| Source Asset Type | Single select | Original video, original photo, render, generated image, generated video, drone, timelapse, narration-only, intro, outro. |
| Trim Start | Decimal seconds | In-point for video. |
| Trim End | Decimal seconds | Out-point for video. |
| Still Duration | Decimal seconds | Duration for a photo/render/still scene. |
| Voice-over Segment | Long text | Exact narration text associated with this scene. |
| On-screen Text | Long text | Rendered scene text. |
| Subtitle Segment | Long text | Subtitle text/timing basis. |
| Transition | Single select / JSON options | Cut, dissolve, fade, or future explicit transition configuration. |
| Crop and Fit Mode | Single select | Contain, cover, smart crop, manual crop. |
| Crop Parameters | Structured data | Optional manual x/y/scale anchor. |
| Output Aspect Ratio | Single select | Initially `9:16`; future target profile value. |
| Generation Requirement | Single select | None, optional future, required future, needs input. |
| Generation Prompt | Long text | Future-only provider-neutral visual generation instruction. |
| Approval Status | Single select | Draft, Approved, Changes Requested, Superseded. |
| Production Status | Single select | Not queued, Queued, Rendering, Rendered, Failed, Superseded. |
| Rendered Asset | Link to Media Assets | Intermediate scene render. |
| Error Summary | Long text | Latest actionable failure; no secrets. |
| Version | Integer | Revision/version number. |

## Media Assets fields

| Field | Purpose |
| --- | --- |
| Asset ID | Stable immutable identifier. |
| Asset Class | Original source, approved source, generated, narration, subtitle, intermediate render, final publication. |
| Parent Asset | Provenance relationship to the original/preceding asset. |
| Origin | Telegram/Bundle Media, engine, TTS adapter, generation adapter, renderer, manual upload. |
| Source Bundle / Bundle Media | Links to existing input where applicable. |
| Content / Scene / Production Run | Links to production ownership. |
| Storage Reference | Provider-neutral URI/object key, not a temporary signed URL. |
| MIME Type / Dimensions / Duration / Checksum | Validation, rendering, duplicate detection. |
| Rights / Approval Status | Permission to use and editorial approval. |
| Provider Job ID | External provider trace when applicable. |
| Version / Superseded By | Immutable derivative lifecycle. |

## Production Runs fields

| Field | Purpose |
| --- | --- |
| Production Run ID | Stable idempotency identifier. |
| Content | Parent Reel Content record. |
| Run Type | Narration, scene render, final assembly, validation, preview delivery, publication handoff. |
| Input Signature | Hash/version of scenes/assets/settings; detects unchanged retries. |
| Status | Queued, running, succeeded, failed, retry scheduled, cancelled, superseded. |
| Attempt | Monotonic retry count. |
| Worker/Provider Job IDs | Reconciliation without coupling to a vendor. |
| Output Assets | Narration/subtitle/intermediate/final assets. |
| Error Code / Summary | Actionable outcome. |
| Started/Completed timestamps | Operations visibility. |

## Scene lifecycle

```text
Draft -> Approved -> Queued -> Rendering -> Rendered
  |                    |                       |
  v                    v                       v
Changes Requested    Failed                 Superseded
```

Editing a rendered scene increments its version, marks prior rendered assets superseded, and invalidates final Reel approval. Reordering scenes also invalidates the final render and approval.

## Scene Director sequence

1. Convert each validated scene brief into a Media Scene record with explicit typed fields.
2. Resolve a source asset or set `Generation Requirement = needs input`; do not use a guessed asset.
3. Check sequence uniqueness, compatible trim/duration values, target aspect ratio, and source rights/approval.
4. Present scenes for user/editor review before final production.
5. On approval, freeze a scene version for the production run; later edits create a revised version rather than mutating the rendered instruction history.

## Asset classifications

| Class | Definition |
| --- | --- |
| Original source asset | User-supplied media from the existing Bundle / Bundle Media. |
| Approved source asset | Original or manually supplied media explicitly approved for use in a production. |
| Generated asset | Future adapter output created from a generation prompt. |
| Narration asset | TTS-produced and normalized audio. |
| Subtitle asset | Timed caption file produced from narration/scene segments. |
| Intermediate render | Rendered visual scene or assembly intermediate. |
| Final publication asset | Validated output ready for preview/publishing. |
