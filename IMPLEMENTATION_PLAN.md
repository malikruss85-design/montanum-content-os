# Implementation Plan

## Objective

Stabilize one safe, observable Phase 1 pipeline before adding video generation, Reel assembly, expanded AI providers, or wider CRM features:

```text
Authorized Telegram input -> one bundle -> validated generation -> editor approval
-> complete written package -> calendar preview -> controlled publishing
```

This is an implementation plan only. No implementation has been performed as part of the audit.

## Phase 0 - Contain and preserve (first)

1. Rotate the OpenAI credential embedded in the collector export and remove it from Make mapper configuration. Search all connected scenario versions and Make history for other literal secrets.
2. Restrict Telegram to authorized users/chats; review Cloudinary unsigned preset permissions and asset visibility.
3. Export the live Make scenario definitions, run history, schedules, connections (metadata only), and Airtable schema/automations/permissions. Record which exported blueprint version corresponds to each live scenario.
4. Back up the Airtable base and export data before schema changes. Preserve all current blueprint and CSV exports unchanged as an audit baseline.

**Exit criterion:** no known hard-coded secret remains active; live configuration is inventoried; a rollback snapshot exists.

## Phase 1 - Decide and model the canonical workflow

1. Choose the bundle-first design as the single intake/generation workflow, subject to live-scenario confirmation.
2. Define canonical Bundle and Content statuses from `AIRTABLE_ANALYSIS.md`, including owner, entry criteria, failure state, and retry policy for each transition.
3. Choose one canonical bundle identifier and one linked-record relationship strategy. Use no copied text field for operational joins.
4. Define required inputs and supported variants: text-only, voice-only, photo-only, video-only, and mixed. State the generation fallback for each.
5. Version prompts outside ad hoc Make fields and specify strict JSON schemas for idea and content-package outputs.

**Exit criterion:** an approved one-page state/transition specification and field map exist before scenarios are changed.

## Phase 2 - Repair the data foundation

1. Add/reconfigure Airtable fields for statuses, run/error data, source identifiers, ordered media, content version, approval, approved assets, and publication receipt.
2. Add an Intake Events or equivalent idempotency mechanism keyed by Telegram update/message identity.
3. Normalize Bundle Media as the canonical source-media list. Keep bundle-level media count/type as computed summaries only.
4. Add a Jobs/Errors table or a minimal equivalent to capture AI/render/publish attempts, provider IDs, costs, retries, and errors.
5. Preserve and classify old data; do not bulk-delete failed, unlinked, or legacy records. Migrate only after a reversible mapping is reviewed.

**Exit criterion:** a new test bundle can be traced through every linked record and every event has a durable identity.

## Phase 3 - Stabilize intake and generation

1. Split the monolithic Telegram collector into Collector and Bundle Finalizer responsibilities.
2. Implement `/new`, `/ready`, `/status`, `/cancel`, and `/help` (or equivalent approved controls); make `/ready` validate usable input before state change.
3. Support normal Telegram photos and media groups, retain ordered media, enforce size/type limits, and return a concise confirmation after each action.
4. Remove or disable the legacy direct Content-generation routes only after test evidence proves the bundle-first generator is live and correct.
5. Make Content Generator claim one Ready bundle atomically, support text/voice/video/photo/mixed strategies, validate JSON, create exactly five linked Content records, and only then set Generated.
6. Add explicit error handling, retry visibility, and Telegram/Airtable notification for operator-actionable failures.

**Exit criterion:** five consecutive controlled intake tests produce one and only one valid bundle each, with no duplicate media or Content ideas.

## Phase 4 - Stabilize editorial and calendar control

1. Implement review/approval/revision action handling and record who approved what, when, and which version.
2. Make Content Writer write only validated complete package data, preserving source prompt/model/version and an editable revision history.
3. Replace carousel text fragments with validated JSON arrays or a Slides table.
4. Make scheduling timezone-aware, capacity-aware across the forward calendar, and idempotent. It must respect intentional dates and show conflicts.
5. Generate/approve final cover and carousel assets before any Scheduled transition; bind publication to explicit approved assets.

**Exit criterion:** an approved test item reaches a calendar preview with complete text and required assets, and a revision safely returns it to Draft.

## Phase 5 - Controlled publishing

1. Make publisher query only content due at the current scheduled timestamp and lock/claim the item before calling Instagram.
2. Save Instagram media ID/permalink, published timestamp, response reference, caption snapshot, and failure details.
3. Start with one manually supervised Feed or Carousel publish. Reconcile the external post before marking the record Published.
4. Add Reels and Stories only after feed/carousel publishing is reliable.

**Exit criterion:** three supervised publish tests produce exactly one external post per approved Content record and record a reconcilable receipt.

## Phase 6 - Operational hardening

1. Document operator runbook, incident/retry procedure, credential rotation process, retention policy, and rollback steps.
2. Create views/interfaces for Active Bundles, Needs Input, Failed Jobs, In Review, Scheduled, and Publish Reconciliation.
3. Add monthly access/secrets review and cost/usage reporting.
4. Move complex media processing, subtitles, audio mixing, video assembly, and provider polling to tested code only when Phase 1 metrics are stable.

## Acceptance metrics

| Measure | Phase 1 target |
| --- | --- |
| Duplicate bundle/content creation | 0 in controlled test runs |
| Traceability | 100% of generated Content links to one source Bundle and run/job |
| Visible failures | 100% of failed external calls create an actionable error record |
| Generation completeness | 100% of successful bundles create exactly five validated ideas |
| Approval trace | 100% of published items have an approval/version record |
| Publish reconciliation | 100% of published records store an Instagram receipt/permalink |

## Sequencing constraints

- Do not alter or delete blueprints based on filenames alone; confirm live Make scenarios first.
- Do not mass-clean Airtable records before exporting a backup and agreeing a migration map.
- Do not add automatic publishing until the Phase 3/4 test evidence is accepted.
- Do not add video generation or media assembly until this core loop meets the acceptance metrics.
