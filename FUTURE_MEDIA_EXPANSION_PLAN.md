# Future Media Expansion Plan

## Guiding rule

Expand by configuration, adapters, rendering profiles, and new approved scene/asset types. Do not rewrite the Collector, Bundle logic, core Airtable tables, Scene entity, asset model, or engine command contract.

## Future media input/output support

| Future type | Engine extension | Core model impact |
| --- | --- | --- |
| Video-only | Additional validation/profile rules | None; original video assets and scenes already support it. |
| Photo-only / render-only | Still motion, hold, pan/zoom scene renderer options | None; use still source type/duration. |
| Mixed video/photo | Timeline sequencing and fit/crop per scene | None. |
| Voice-only | Voice-led scene plan using approved original/generation-ready visual sources | No Bundle redesign; may require a `needs input` state. |
| AI-generated images | Enable existing image adapter and `generated image` scene asset type after policy/approval | Uses generated asset + prompt fields already defined. |
| AI-generated video | Enable video adapter and worker polling after source-lock/QC policy | Uses generated video asset + prompt fields already defined. |
| Drone footage | Add source classification and stabilization/color processing profile | No structural change. |
| Construction timelapse | Add sequence/time-lapse scene profile and chronological validation | No structural change. |
| Project progress video | Add update-date/project milestone metadata and narrative templates | No structural change. |
| Presentation film | Add wider duration/profile and multi-section assembly template | No core rewrite. |

## Future channel profiles

| Channel | When to add | Required addition |
| --- | --- | --- |
| Instagram Reels | MVP | `instagram_reel_9x16` profile and isolated publisher handoff. |
| LinkedIn video | After Reel reliability is accepted | New profile, caption metadata, and LinkedIn-specific publishing handoff. |
| YouTube Shorts | After LinkedIn decision and asset QA maturity | New profile, title/description metadata, and YouTube handoff. |
| TikTok | After platform policy/approval workflow is approved | New profile, sound/caption policy, and TikTok handoff. |

No future channel should reuse the Instagram Publisher's post route blindly. Each is a new publication adapter/handoff that consumes the same final publication asset with channel-specific metadata and receipt fields.

## Future capability release order

1. Stabilize original-media Instagram Reel MVP and its retry/approval/publish receipts.
2. Add provider-neutral TTS selection and production monitoring only after the MVP contracts are proven.
3. Add photo/render motion refinements and presentation-film templates.
4. Add AI image generation with prompt/version/rights/approval controls.
5. Add AI video generation with provider polling, architectural source-lock QA, and cost limits.
6. Add channel-specific publication adapters one at a time, starting only after each target's approval/reconciliation policy is defined.

## Expansion controls

- Every generated asset requires a scene-level generation requirement, approved prompt, provider job trace, and editorial approval.
- Every new rendering profile uses the existing scene/timeline contract and validation suite.
- Every new publisher stores an external receipt and cannot create a duplicate post on retry.
- A new adapter or channel is enabled only after a representative test matrix, cost limits, rate limits, retention rules, and rollback/retry procedure are accepted.

## What remains intentionally deferred

- Final provider selection for TTS, image generation, video generation, storage, and render workers.
- Automatic media generation.
- Multi-language/multi-voice productions.
- Full sound design, licensed music, advanced color grading, and complex transitions.
- LinkedIn, YouTube, TikTok, and all other non-Instagram publishing.
