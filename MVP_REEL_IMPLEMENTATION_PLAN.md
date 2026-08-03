# MVP Reel Implementation Plan

## Fixed MVP boundary

The MVP produces Instagram Reels using only original user-supplied video/images from existing Bundles, one narration track, burned-in subtitles, simple cuts, optional intro/outro, Telegram preview, manual approval, and Instagram publication. AI image/video generation and all non-Instagram channels are explicitly excluded.

## Step 1 - Confirm constraints and live integration points

1. Confirm the existing Collector's successful multi-media Bundle workflow without modifying it.
2. Confirm the existing Content generation/writer path can create/select `Post Type = Reel` Content records.
3. Confirm the live Make scenario schedule/connection layout and existing Instagram publishing capability.
4. Approve initial Reel profile: 9:16 output, allowed duration range, subtitle style, and intro/outro defaults.

**Done when:** the live workflow entry/exit points are documented and no existing scenario has changed.

## Step 2 - Add only additive production records/fields

1. Add Media Scenes as typed, linked scene entities.
2. Add Media Assets and Production Runs either in Airtable or engine persistence, retaining Airtable as the operator surface.
3. Add concise Reel production and approval fields to existing Content without modifying carousel fields/filters.
4. Create operator views for scene review, queued production, failed runs, preview approval, and approved Reels.

**Done when:** one existing Reel Content record can link ordered scenes, source assets, a production run, and final output metadata.

## Step 3 - Build the engine foundation

1. Implement the Production API, storage abstraction, asset resolver, run store, idempotency handling, callback/event layer, and provider adapter interfaces.
2. Implement a rendering worker adapter capable of original-video trim, still-image hold/motion, crop/fit, simple cuts, optional intro/outro, narration mix, subtitle burn-in, and final validation.
3. Implement a provider-neutral TTS adapter contract but defer provider selection until separately approved.
4. Implement structured logs and retry state. Do not put rendering or polling logic in Make.

**Done when:** a local/non-production run can render a controlled test timeline reproducibly from stable asset references.

## Step 4 - Connect AI and Scene Directors

1. Implement bundle-aware Content Director output validation.
2. Convert its valid scene briefs into editable Media Scene records.
3. Require editor approval of scenes before the engine starts production.
4. Ensure source asset references resolve only to the parent Bundle's approved original media.

**Done when:** one mixed-media Bundle produces an editable, approved scene sequence with no generated assets.

## Step 5 - Connect Make for controlled orchestration

1. Add a dedicated Reel production trigger that sends `start_production` only for approved scenes.
2. Receive/deduplicate engine callbacks and update Airtable operator status/assets.
3. Send Telegram preview only after engine validation succeeds.
4. Add retry action that references an existing production run rather than recreating Scenes or Bundles.

**Done when:** one manual on-demand test produces a preview and a recoverable failed run without affecting the carousel pipeline.

## Step 6 - Add manual approval and publishing handoff

1. Add Telegram approval/revision interactions for the final asset.
2. Make every scene/final asset change clear prior approval.
3. Extend the existing Instagram Publisher with an isolated Reel route; retain all feed/carousel routes untouched.
4. Require approved final asset, due time, and no existing Instagram receipt before post creation.
5. Save Reel ID/permalink/timestamp on success; preserve retry state on failure.

**Done when:** one supervised approved preview is published exactly once as an Instagram Reel.

## Verification suite

- Video-only Bundle.
- Photo/render-only Bundle.
- Mixed video/photo Bundle.
- Voice-plus-video Bundle.
- Scene revision after render (confirms approval invalidation).
- TTS/worker retry (confirms no duplicate assets/runs).
- Instagram publish retry (confirms no duplicate post).

## Non-regression gates

- Existing Collector can still create and collect Bundles unchanged.
- Existing Cover Generator still renders carousels unchanged.
- Existing feed/carousel Publisher still handles only its existing routes unchanged.
- No production run performs AI image/video generation.
