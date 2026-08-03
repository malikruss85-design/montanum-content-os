# Reel Implementation Plan

## Goal

Implement a provider-neutral, approval-gated Instagram Reel production path on top of the existing Bundle workflow, without redesigning the Collector or disrupting the carousel pipeline.

No implementation has been performed in this planning stage.

## Phase 1 - Confirm and prepare

1. Confirm the live Make scenario corresponding to each exported blueprint and record current schedules.
2. Confirm that the existing Collector creates/appends one Bundle for a mixed-media Telegram submission; do not change its successful Bundle logic.
3. Identify the canonical Bundle-to-Content generation route used in production and observe whether direct Collector ideation currently creates duplicate Content records.
4. Confirm Instagram Business supports the intended Reel publishing capability through the existing connection before building its route.
5. Agree the initial Reel constraints: maximum duration, accepted input media, default subtitle style, supported narration language, and whether intro/outro/transitions begin disabled.

**Acceptance:** live scenario inventory and one agreed Reel-output specification, with no configuration changes.

## Phase 2 - Add Airtable Reel fields

1. Add the fields defined in `REEL_DATA_MODEL.md` to the existing Content table.
2. Create filtered Airtable views for `Reel Brief Ready`, `Reel Production Queue`, `Reel Approval Required`, `Reel Production Failed`, and `Approved Reels`.
3. Keep all existing carousel fields, views, and automation filters unchanged.
4. Define the controlled Reel Production Status options and record a short operator description for each.

**Acceptance:** a test Reel Content record can hold its scripts, request ID, narration/subtitles/final Reel URLs, status, and approval data without modifying a carousel record.

## Phase 3 - Generate the Reel brief

1. Extend or add a dedicated Bundle-aware Reel brief step that reads the complete Bundle: video/photo/render list, ordered media, text, voice transcript, and project context.
2. Create a strict structured output contract for topic, hook, complete Reel script, voice-over script, caption, CTA, hashtags, and scene plan.
3. Validate JSON and verify every scene source belongs to the Content record's linked Bundle before saving.
4. Store the Reel brief on a `Post Type = Reel` Content record and set `Reel Production Status = Brief Ready`.
5. Make this step idempotent: regeneration creates a new editorial revision, not a duplicate Content record.

**Acceptance:** one mixed-media Bundle produces one complete, valid Reel brief with a scene plan tied only to its own media.

## Phase 4 - Build provider-neutral production adapters

1. Define the TTS adapter request/response contract in `REEL_PRODUCTION_ARCHITECTURE.md`.
2. Define the video-assembly request/response contract in the same way.
3. Choose hosting/implementation technology only after the contracts and operational limits are approved. Do not select a TTS provider during the design phase.
4. Add structured error, retry, job ID, and idempotency behaviour to both adapters.
5. Test adapters with non-production sample assets before connecting them to scheduled Make scenarios.

**Acceptance:** each adapter can be replaced without Airtable schema or Make editorial changes; both report a stable job ID, output URL, and actionable error state.

## Phase 5 - Orchestrate one Reel preview

1. Add a separate Reel Production Orchestrator scenario triggered manually/on-demand from `Brief Ready`.
2. Assign the request ID, request narration, save audio, request subtitle/render assembly, save subtitle/final Reel/duration, and validate the result.
3. Use source videos first; use photos/renders only according to the approved scene plan. Keep intro/outro/transitions off by default.
4. Set `Production Failed` on a recoverable failure; never overwrite a previous successful preview with an incomplete result.
5. Send the completed Reel preview to Telegram and move to `Approval Required`.

**Acceptance:** a single Reel reaches Telegram preview with narration, subtitles, and final vertical MP4, without automatically publishing.

## Phase 6 - Manual approval and Reel publishing

1. Add Telegram approval/revision actions that update only the target Reel Content record.
2. Approval records approver/time and moves the Reel to `Approved for Publishing`; revision returns it to editorial status and invalidates the old approval.
3. Add a Reel route to the existing Instagram Publisher only after the preview/approval path is tested.
4. The route must require: `Post Type = Reel`, `Reel Production Status = Approved for Publishing`, a Final Reel URL, and a due publish time.
5. Store Instagram Reel ID/permalink/published time before marking `Published`.
6. Perform the first Reel post under manual supervision; retain retry evidence if Instagram returns an error.

**Acceptance:** one approved preview is posted exactly once as an Instagram Reel and the Content record stores a verifiable receipt.

## Phase 7 - Stabilize without expanding scope

1. Run five representative Bundles: video-only, mixed video/photo, voice-plus-video, render-plus-text, and a revision case.
2. Check duplicate Bundle, Content, TTS, assembly, preview, and publish behaviour on every run.
3. Document the operator procedure for retrying narration/render, requesting revision, approving a preview, and resolving a failed post.
4. Keep LinkedIn, YouTube, TikTok, AI video generation, and advanced effects out of the work until these tests are accepted.

## Non-negotiable safeguards

- Do not alter the existing Telegram Collector's Bundle creation/appending logic while implementing Reels.
- Do not change the Cover Generator or carousel publisher routes for Reel work.
- Do not choose or hard-code a TTS provider before the provider-neutral contracts are approved.
- Do not publish from a raw Bundle video; publish only the approved `Final Reel`.
- Do not auto-publish a Reel. Manual approval is required for every production version.
