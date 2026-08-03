# Montanum - Reel Brief Generator: Implementation

## Purpose and boundary

This is a new, scheduled/manual Make scenario. It reads one completed existing Content Bundle and creates or updates exactly one `Content` record for the first supported brief:

```text
Content Section = Projects
Reel Type = Project Showcase
Post Type = Reel
```

It does not render video, call TTS, send Telegram messages, publish, create Bundles, alter the Collector, or alter carousel/feed routes.

## Required preconditions

1. Apply the additive Airtable schema in `AIRTABLE_REEL_SCHEMA_FINAL.md`, including the additions documented in this task.
2. Add the `Media Scenes` table and exact field names before enabling the scenario.
3. Provide one OpenAI connection in Make secret storage. Do not use literal keys in modules.
4. Create a new Content view named `Bundles Ready for Reel Brief` with this filter:

```text
Content Bundles is not empty
AND Post Type = Reel
AND Reel Production Status = Not Requested
AND Content Section = Projects
AND Reel Type = Project Showcase
```

The initial Reel Content record may be manually created and linked to the Bundle. If the desired operating model is Bundle-first automatic record creation, add `Reel Brief Idempotency Key` to Content exactly as specified and use the lookup/create branch below.

## Canonical idempotency

```text
brief:{Content Bundle Airtable record ID}:project_showcase:{Reel Brief Version}
```

The scenario always searches Content first by `Reel Brief Idempotency Key`. It creates a new Reel Content record only when no matching record exists. A repeated run with the same key updates/returns the matching record; it never creates a second record.

A material output change increments `Reel Brief Version`, writes a new idempotency key for the new version, sets `Reel Approval Status = Invalidated`, and leaves all existing assets/runs intact. Before implementation, decide whether version increments are manual or triggered by an explicit regenerate action; the scheduled scenario must not increment versions by itself.

## Exact outcome mapping

| Required brief output | Airtable field / handling |
| --- | --- |
| Reel ID | Existing Airtable Content record ID; do not create a duplicate field. |
| Bundle ID | Existing linked `Content Bundles`; do not create a duplicate field. |
| Project | Existing `Project` link, copied only if a Bundle Project link is present. |
| Content Section / Reel Type | `Content Section` / `Reel Type`. |
| Working Title / Hook / CTA | Existing `Title` / `Hook` / `CTA`. |
| Core Message / Story Structure | `Core Message` / `Story Structure`. |
| Complete Reel script | Existing `Reel Script`. |
| Voice-over / Subtitle | `Voice-over Script` / `Subtitle Script`. |
| Caption / hashtags | Existing `Caption` / `Hashtags`; `Final Caption` remains untouched. |
| Duration / aspect / language | `Reel Duration Seconds` / `Reel Target Profile` / `Narration Language`. |
| Scene plan | `Scene Plan JSON` audit copy plus one typed Media Scenes row per scene. |
| Media/missing notes/readiness | `Media Selection Notes` / `Missing Media Notes` / `Rendering Readiness`. |
| Workflow metadata | `Reel Production Status`, `Reel Brief Version`, `Reel Brief Generated At`, `Reel Generator Model`, `Reel Production Error`. |

## Processing status transitions

```text
Not Requested -> Brief generating (temporary Make execution state, do not add a new select)
              -> Scenes In Review (valid brief and scenes written)
              -> Production Failed (any terminal failure)
```

The approved production status list does not contain `Brief Generating`. During one Make execution, retain `Not Requested`; write `Scenes In Review` only after all Content and Scene writes succeed. On failure write `Production Failed` and `Reel Production Error`.

## Safe write sequence

1. Compute the idempotency key from Bundle record ID, fixed `project_showcase`, and input Brief Version (default `1` only for a first record).
2. Search Content for the exact key. If found, use it as target; if missing, create one minimal Content record with Bundle link, Post Type Reel, Section/Type, version/key, and `Not Requested`.
3. Load complete Bundle, linked Bundle Media, and linked Project if present.
4. Reject no-media/no-text/no-transcript bundles with `Production Failed`; do not call GPT.
5. Generate and parse strict JSON with `REEL_PROJECT_SHOWCASE_PROMPT.md` and `REEL_BRIEF_JSON_SCHEMA.json`.
6. Validate all scene source IDs against the loaded Bundle Media record IDs and validate scene duration sum against target duration.
7. Prepare all scene records. Do not write Content's success status before the scene payload is valid.
8. Upsert Media Scenes by `Scene ID`; never blindly create a second scene set for the same Content/Scene Version.
9. Update target Content with all mapped brief fields, status `Scenes In Review`, error cleared, approval status `Not Requested` for a first brief or `Invalidated` for a material revision.
10. Record human-readable errors in `Reel Production Error` for every failure route.

No importable Make blueprint JSON is supplied because Airtable field IDs, connections, and model connection metadata are absent from the repository. The module map provides an exact manual build specification.
