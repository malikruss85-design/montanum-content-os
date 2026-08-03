# Airtable Reel Schema Final

## Scope and preservation rule

This is an additive specification. Do not rename, delete, repurpose, or change existing fields, core tables, views, automations, or carousel/feed publishing routes. Create the tables/fields below only after the local engine is approved for integration.

## Existing Content table - fields to add exactly

| Field name | Airtable type | Required values / notes |
| --- | --- | --- |
| `Reel Production Status` | Single select | Exact values listed below. |
| `Reel Brief Version` | Number, integer | Increment when editorial/scene brief changes. |
| `Reel Brief Idempotency Key` | Single line text | Exact key: `brief:{Bundle Airtable Record ID}:project_showcase:{Reel Brief Version}`. |
| `Content Section` | Single select | First supported value: `Projects`. |
| `Reel Type` | Single select | First supported value: `Project Showcase`. |
| `Core Message` | Long text | Specific project-value statement. |
| `Story Structure` | Long text | Concise editorial progression. |
| `Subtitle Script` | Long text | Complete subtitle source text. |
| `Scene Plan JSON` | Long text | Validated GPT scene-plan payload retained for audit; typed `Media Scenes` remain canonical editable scenes. |
| `Media Selection Notes` | Long text | Why the selected source media supports the brief. |
| `Missing Media Notes` | Long text | Missing/insufficient source media; no invented assets. |
| `Rendering Readiness` | Single select | `Ready`, `Needs Review`, `Needs Media`. |
| `Reel Brief Generated At` | Date, include time | GPT brief creation/update time. |
| `Reel Generator Model` | Single line text | Model identifier used for the brief. |
| `Reel Production Request ID` | Single line text | Engine idempotency key. |
| `Reel Production Run ID` | Single line text | Latest engine run ID. |
| `Reel Target Profile` | Single select | `instagram_reel_9x16` initially. |
| `Voice-over Script` | Long text | Final narration text. |
| `Narration Language` | Single select | `English`, `Russian`. |
| `Voice Profile` | Single line text | Provider-neutral voice profile key. |
| `Narration Asset` | URL | Durable engine/storage asset reference. |
| `Subtitle Asset` | URL | Durable SRT/VTT reference. |
| `Final Reel Asset` | URL | Durable validated MP4 reference. |
| `Reel Duration Seconds` | Number, decimal | Engine validation result. |
| `Reel Validation Summary` | Long text | Dimensions/duration/audio result; no secrets. |
| `Reel Production Error` | Long text | Current actionable error; no secrets. |
| `Reel Preview Sent At` | Date, include time | Telegram preview delivery timestamp. |
| `Reel Approval Status` | Single select | Exact values below. |
| `Reel Approved At` | Date, include time | Approval timestamp. |
| `Reel Approved By` | Single line text | Telegram/Airtable actor reference. |
| `Instagram Reel ID` | Single line text | Set only after confirmed publishing. |
| `Instagram Reel Permalink` | URL | Set only after confirmed publishing. |
| `Instagram Reel Published At` | Date, include time | Set only after confirmed publishing. |
| `Media Scenes` | Link to another record | Link to `Media Scenes`, allow multiple. |
| `Media Assets` | Link to another record | Link to `Media Assets`, allow multiple. |
| `Production Runs` | Link to another record | Link to `Production Runs`, allow multiple. |

### Exact select values

`Reel Production Status`:

```text
Not Requested
Brief Ready
Scenes In Review
Scenes Approved
Queued
Narration Generating
Narration Ready
Assembly Rendering
Preview Ready
Approval Required
Approved for Publishing
Production Failed
Published
```

`Reel Approval Status`:

```text
Not Requested
Pending Approval
Approved
Revision Requested
Invalidated
```

`Rendering Readiness`:

```text
Ready
Needs Review
Needs Media
```

`Content Section`:

```text
Projects
```

`Reel Type`:

```text
Project Showcase
```

## New `Media Scenes` table

Primary field: `Scene ID` (single-line text; engine-generated immutable ID).

| Field name | Type |
| --- | --- |
| `Content` | Link to `Content`, single record required |
| `Sequence` | Number, integer |
| `Source Asset` | Link to `Media Assets`, single record |
| `Source Bundle Media` | Link to existing `Bundle Media`, single record |
| `Source Asset Type` | Single select: `Original Video`, `Original Photo`, `Render`, `Drone`, `Timelapse`, `Intro`, `Outro`, `Generated Image`, `Generated Video`, `Narration Only` |
| `Trim Start Seconds` | Number, decimal |
| `Trim End Seconds` | Number, decimal |
| `Still Duration Seconds` | Number, decimal |
| `Voice-over Segment` | Long text |
| `On-screen Text` | Long text |
| `Subtitle Segment` | Long text |
| `Transition` | Single select: `Cut`, `Fade`, `Dissolve` |
| `Crop and Fit Mode` | Single select: `Cover`, `Contain`, `Smart Crop`, `Manual Crop` |
| `Crop Parameters` | Long text (validated JSON) |
| `Output Aspect Ratio` | Single select: `9:16` |
| `Generation Requirement` | Single select: `None`, `Optional Future`, `Required Future`, `Needs Input` |
| `Generation Prompt` | Long text |
| `Scene Approval Status` | Single select: `Draft`, `Approved`, `Changes Requested`, `Superseded` |
| `Scene Production Status` | Single select: `Not Queued`, `Queued`, `Rendering`, `Rendered`, `Failed`, `Superseded` |
| `Rendered Asset` | Link to `Media Assets`, single record |
| `Scene Version` | Number, integer |
| `Error Summary` | Long text |

## New `Media Assets` table

Primary field: `Asset ID` (single-line text; immutable engine-generated ID).

| Field name | Type |
| --- | --- |
| `Asset Class` | Single select: `Original Source`, `Approved Source`, `Generated`, `Narration`, `Subtitle`, `Intermediate Render`, `Final Publication` |
| `Parent Asset` | Link to `Media Assets`, single record |
| `Origin` | Single select: `Bundle Media`, `Engine`, `Mock TTS`, `TTS Provider`, `Image Provider`, `Video Provider`, `Renderer`, `Manual Upload` |
| `Content` | Link to `Content`, single record |
| `Scene` | Link to `Media Scenes`, single record |
| `Production Run` | Link to `Production Runs`, single record |
| `Source Bundle Media` | Link to existing `Bundle Media`, single record |
| `Storage Reference` | URL |
| `MIME Type` | Single line text |
| `Width` | Number, integer |
| `Height` | Number, integer |
| `Duration Seconds` | Number, decimal |
| `Checksum SHA-256` | Single line text |
| `Rights Status` | Single select: `Unknown`, `Approved`, `Restricted`, `Expired` |
| `Asset Approval Status` | Single select: `Draft`, `Approved`, `Superseded`, `Rejected` |
| `Provider Job ID` | Single line text |
| `Asset Version` | Number, integer |
| `Superseded By` | Link to `Media Assets`, single record |

## New `Production Runs` table

Primary field: `Production Run ID` (single-line text; engine-generated immutable ID).

| Field name | Type |
| --- | --- |
| `Content` | Link to `Content`, single record required |
| `Run Type` | Single select: `Narration`, `Scene Render`, `Final Assembly`, `Validation`, `Preview Delivery`, `Publication Handoff` |
| `Input Signature` | Single line text |
| `Status` | Single select: `Queued`, `Running`, `Succeeded`, `Failed`, `Retry Scheduled`, `Cancelled`, `Superseded` |
| `Attempt` | Number, integer |
| `Worker Job ID` | Single line text |
| `Provider Job ID` | Single line text |
| `Output Assets` | Link to `Media Assets`, allow multiple |
| `Error Code` | Single line text |
| `Error Summary` | Long text |
| `Started At` | Date, include time |
| `Completed At` | Date, include time |
| `Callback Event ID` | Single line text |

## Required relationships

```text
Content 1 -> many Media Scenes
Content 1 -> many Media Assets
Content 1 -> many Production Runs
Media Scene -> one Source Bundle Media or one Source Asset
Production Run -> many Output Assets
Media Asset -> optional parent Media Asset and optional Scene/Run
```

Existing Bundle/Bundle Media relationships remain unchanged. `Source Bundle Media` links are additive references, not replacement joins.
