# Airtable Additive Changes Next Step

Do not apply this step until the local engine is approved.

Keep all existing core tables and carousel fields. The later integration should add, rather than replace:

- Reel production summary fields on existing Content: Production Status, Production Request/Run ID, Narration, Subtitle File, Final Reel, error summary, preview timestamp, approver/time, Instagram Reel receipt.
- A `Media Scenes` table with the typed fields specified in `SCENE_DIRECTOR_AND_DATA_MODEL.md`.
- A `Media Assets` table and `Production Runs` table, or engine persistence with Airtable summary links, according to the approved operational choice.
- Views for Scene Review, Reel Production Queue, Production Failed, Preview Approval, and Approved for Publishing.

No change should alter the Collector's Bundle relationships or existing carousel/publishing automation filters.
