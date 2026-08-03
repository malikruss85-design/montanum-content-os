# Make Reel Field Mapping

Use these exact Airtable field names from `AIRTABLE_REEL_SCHEMA_FINAL.md`.

| Scenario | Reads | Writes |
| --- | --- | --- |
| Reel Brief Generator | `Content Bundles`, `Post Type`, `Reel Production Status`, existing editorial fields, `Bundle Media` | `Reel Brief Version`, `Voice-over Script`, existing Title/Hook/Reel Script/Caption/CTA/Hashtags, `Reel Production Status`, `Reel Approval Status`, `Media Scenes` |
| Reel Production Starter | `Reel Production Status`, `Reel Approval Status`, `Media Scenes`, `Media Assets`, `Content Bundles` | `Reel Production Request ID`, `Reel Production Run ID`, `Reel Production Status`, `Reel Production Error`, `Production Runs` |
| Callback Handler | `Reel Production Run ID`, `Production Runs` | `Narration Asset`, `Subtitle Asset`, `Final Reel Asset`, `Reel Duration Seconds`, `Reel Validation Summary`, `Reel Production Status`, `Reel Production Error`, `Reel Approval Status`, `Production Runs.Callback Event ID` |
| Telegram Preview/Approval | `Final Reel Asset`, `Reel Approval Status`, `Reel Production Status` | `Reel Preview Sent At`, `Reel Approved At`, `Reel Approved By`, `Reel Approval Status`, `Reel Production Status` |
| Instagram Reel Route | `Final Reel Asset`, `Final Caption`, `Reel Approval Status`, `Reel Production Status`, `Instagram Reel ID` | `Instagram Reel ID`, `Instagram Reel Permalink`, `Instagram Reel Published At`, `Reel Production Status` |

## Engine payload mapping

| Engine command field | Make/Airtable source |
| --- | --- |
| `content_id` | Airtable Content record ID |
| `bundle_id` | Linked Content Bundle record ID |
| `idempotency_key` | Exact Reel starter pattern from scenario specification |
| `scene_version` | Highest approved `Media Scenes.Scene Version` |
| `target_profile` | `Reel Target Profile` (`instagram_reel_9x16`) |
| `scenes` | Ordered typed `Media Scenes` mapped to engine contract fields |
| `voiceOverScript` | `Voice-over Script` |
| `subtitleText` | Concatenated ordered `Subtitle Segment`, falling back to Voice-over Script only if expressly approved |
