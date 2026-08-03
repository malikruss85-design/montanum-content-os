# Current System Audit

Audit date: 3 August 2026  
Scope: all project folders, seven Make blueprint exports, four Airtable table exports, Airtable screenshots, Telegram setup documentation, environment-variable example, the Montanum knowledge base, Brand Brain, and the two supplied PDF portfolio files. No existing project file was changed.

## Executive finding

Montanum Content OS is a promising Phase 1 content pipeline, but it is not a reliable end-to-end production system. It has working building blocks for Telegram ingestion, Cloudinary storage, Airtable records, AI ideation, writing, cover generation, scheduling, and Instagram publishing. However, the blueprints implement two incompatible ingestion/generation designs, the Airtable state data does not match the scenarios' expected statuses, and the last-mile production and publication paths are incomplete or unsafe.

The largest immediate concern is security: a live-looking OpenAI API credential is embedded directly in the Telegram collector blueprint. Treat it as compromised, revoke/rotate it, and remove it from the scenario before further use. This audit intentionally does not reproduce the secret.

## As-built workflow

```text
Telegram update
  -> Telegram Collector (one large, multi-route Make scenario)
     -> Cloudinary upload (photos/videos)
     -> Airtable Content Bundles and Bundle Media
     -> in some routes, GPT ideation directly into Content
  -> `finish` text marks an open bundle Ready
  -> Content Generator searches a Ready bundle with photo media
     -> vision analysis -> GPT creates 5 Content ideas -> Content records
  -> manual status change to Approved
  -> Content Writer -> Caption / slides / Reel script / Stories -> Written
  -> Scheduler -> Scheduled
  -> Cover Generator (carousels) -> Cloudinary cover and image URL list
  -> Instagram Publisher (feed photo or carousel) -> Posted
```

The intended documented flow is simpler and safer: Telegram -> one Content Bundle -> GPT -> Airtable Content -> review/approval -> calendar -> Instagram. The supplied blueprints only partially implement that design.

## Evidence from exported Airtable data

- Content Bundles: 34 records: 19 `Failed`, 14 `Ready`, 1 `Collecting`.
- Bundle GPT status: 27 `Done`, 3 `Error`, 4 blank. Yet the visible output fields (`GPT Output`, `Content Generated`) are empty and no exported bundle has `Linked Content`.
- Content: 24 records: 14 `Draft`, 9 `Idea`, 1 `Posted`. No exported record is `Approved`, `Written`, or `Scheduled`, although those are prerequisites in downstream scenarios.
- All 24 exported Content records have blank caption, final caption, carousel slides, Reel script, Stories, hashtags, cover image, carousel URLs, Instagram carousel URLs, publish date, score, and pillar.
- Bundle Media: 63 records. Four have no bundle, four have no file data, and only 2 have `Order`; `Slider order` is populated but is not used by the examined blueprints.
- Projects: four records (Eco Sanur, Anusara, Roscha, GoMandor Office). Project-to-bundle links and main content angles are blank in the export.

These are not merely cosmetic gaps: they show that the expected statuses and final output fields have not been reached in the exported operating data.

## Component audit

| Component | What exists | Audit result |
| --- | --- | --- |
| Telegram collector | Text, document-photo, voice, video, and `finish` routes | Partially implemented; combines collection and direct generation, does not provide documented commands/buttons/responses, and has flawed routing/data mappings. |
| Cloudinary | Direct unsigned uploads from Make | Operational building block, but public upload preset and storage governance need review. |
| Content Bundles / Bundle Media | Four-table Airtable model with bundle/media links | Correct direction, but referential integrity, media ordering, project linking, and job/error fields are incomplete. |
| Content Generator | Ready bundle -> photos -> vision analysis -> five content ideas | Only accepts photo media; video, voice-only, and text-only bundles are marked error. No persistent Processing/Generated state. |
| Content Writer | Approved Content -> OpenAI JSON -> Written | Functional shape, but no schema validation, no revision flow, and output contract is brittle. |
| Scheduler | Written -> today/tomorrow scheduling | Implemented, but it ignores pre-existing dates and only calculates today's capacity; it has spelling/status and throughput issues. |
| Cover Generator | Carousel text + bundle photos -> rendered images / Cloudinary | Generates output URLs, but has no idempotency/status gate and can reprocess the same record indefinitely. |
| Instagram Publisher | Scheduled feed photo/carousel -> Instagram -> Posted | Partial. There is no scheduling-time eligibility test, no publish receipt/permalink capture, no error handler, and no Reel/Story publishing. |

## Broken or unreliable logic

1. **Two content-generation paths run in parallel.** The Telegram collector creates direct Content ideas for ordinary text and its document-photo route, while separate routes also create/update a Content Bundle. The independent Content Generator later processes the bundle and creates another five ideas. This creates duplicate concepts and makes source-of-truth unclear.
2. **The separate generator rejects supported input types.** It searches only `Bundle Media` where type is `Photo`; a valid voice-only, text-only, or video-only bundle is set to GPT `Error`, although the product and bot documentation claim support for all those inputs.
3. **The first voice-bundle creation uses the wrong Telegram source path.** It maps chat ID from `edited_channel_post` rather than the received message. For normal voice messages this can produce a blank/invalid chat ID and prevent later items from joining the correct bundle.
4. **Photo handling appears limited to Telegram documents.** The photo route checks `message.document.file_id`, not the usual Telegram photo payload. Normal photo uploads may therefore be missed unless sent as files.
5. **Video handling overwrites bundle-level media metadata.** An existing bundle is changed to a single `Video` type/count and attachment rather than aggregating its existing contents. The same pattern risks losing the summary of mixed-media bundles.
6. **No media idempotency.** Telegram Message ID is not mapped on several create routes and no update-ID/message-ID uniqueness check exists. Retried Make operations can duplicate media and ideas.
7. **Non-deterministic active bundle selection.** Searches use chat ID plus `Collecting`, max one, without a sort or an enforced one-open-bundle rule. Two collecting records can associate new input unpredictably.
8. **Unstable / wrong joins.** The generator uses `Bundle = {{Bundle ID}}` while other scenarios use `Bundle ID Text = {{Bundle ID Auto}}`. The data model exposes both ID forms; without typed canonical joins this is fragile.
9. **Content generation completion is misleading.** The generator sets GPT status `Done` without setting bundle status to Generated/Completed, saving the GPT output, validating created-record count, or linking resulting Content records in a traceable way.
10. **Status model divergence blocks downstream automation.** Exports show `Idea`, `Draft`, and `Posted`; scenarios require `Approved`, `Written`, and `Scheduled`; the knowledge base prescribes an additional Review/Media Production/Ready to Publish model. There is no canonical finite-state machine.
11. **The writer's carousel JSON contract is malformed by design.** It asks the model for a string of JSON objects without enclosing brackets, then Cover Generator later adds brackets. Any variation, escaped character, or text outside the objects breaks parsing. This should be a native JSON array validated before write.
12. **Cover-to-media mapping is unsafe.** It maps one generated slide per original photo by index, regardless of whether slide count equals photo count. It also does not escape titles/text injected into HTML and does not set a state that prevents repeat rendering.
13. **Scheduler capacity is not an overall calendar algorithm.** It processes up to five Written records, compares only today's scheduled count against two, then schedules each candidate today or tomorrow. It does not consider future dates, ordering, time zone, or idempotent date assignment.
14. **Publisher has a typo-sensitive Feed route.** Its search accepts `Feed Post`, but the route filter checks `Feed post`; case-insensitive matching likely masks the capitalization difference, but it remains an avoidable mismatch. More importantly, it marks records Posted without persisting provider result data.
15. **No durable error, retry, or alert path.** All exported scenarios have a generic maximum-error setting but no explicit error handlers, error table, retry state, or human notification.

## Security risks

| Severity | Finding | Risk | Required response |
| --- | --- | --- | --- |
| Critical | An OpenAI secret is hard-coded in a Make HTTP transcription request | Repository leakage, unauthorized API use, billing exposure, and inability to rotate safely | Revoke/rotate immediately; remove from blueprint; use a protected Make connection/secret. |
| High | Cloudinary uses an unsigned upload preset from a public HTTP endpoint | Anyone who knows or obtains the preset can potentially upload unwanted content or consume quota | Restrict/replace with signed uploads; constrain formats, size, folder, and origins; monitor usage. |
| High | No authorization allowlist for Telegram chats/users is visible | Any party able to message the bot may send content into internal storage/AI workflows | Enforce explicit allowed chat/user IDs and reject unknown updates before download/upload. |
| High | Media URLs and Airtable attachment links are copied across services | Client/project media may be exposed beyond intended access or retained indefinitely | Define private delivery, access policy, retention, and removal procedures. |
| Medium | Prompts are generated from untrusted Telegram text/transcripts | Prompt injection can alter outputs, leak contextual instructions, or create unsafe content | Delimit untrusted input, use structured schemas, and validate output before side effects. |
| Medium | Blueprint exports contain internal IDs, account ID, Cloudinary cloud name, and connection metadata | Reconnaissance value and accidental disclosure | Treat exports as internal; keep secrets out; restrict repository access. |
| Medium | No audit trail for publication API responses or operator actions | Failed/duplicate posts cannot be reconciled reliably | Store provider job ID, post ID/permalink, timestamps, actor, and raw error reference. |

## Immediate priorities before any expansion

1. Rotate the exposed OpenAI credential and audit its usage.
2. Select one canonical collector/generator path; disable or archive the other only after a controlled comparison of the live Make scenarios.
3. Establish a single documented bundle and content state model, then align Airtable views and every Make filter to it.
4. Stabilize one test: voice + several photos -> bundle -> five ideas -> approval -> written content -> calendar preview. Do not enable automatic Instagram publication during this test.
5. Add observability and idempotency before adding video generation, Reels assembly, or further providers.

## Audit limitations

- The repository contains exported blueprints, not live Make scenario configuration/history. Scenario schedules, active/inactive state, error-handler configuration outside exports, connection permissions, and which numbered scenario is live cannot be verified locally.
- Airtable CSVs and screenshots reveal values and visible fields, but not every field type, formula, validation rule, view filter, automation, interface, or permission setting. The final structural decisions should be confirmed with an Airtable schema export.
- The two PDFs contain image-based portfolio material with no extractable text in this environment; they were accounted for as brand/project reference assets but did not expose system logic.
