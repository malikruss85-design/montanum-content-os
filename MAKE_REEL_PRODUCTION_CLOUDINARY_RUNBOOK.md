# Reel Production — Cloudinary Assembly: Make runbook

This runbook defines the **new, separate** Make scenario. It must remain disabled until the acceptance test described below is deliberately run. It does not replace the Telegram Collector, Reel Brief Generator, calendar or Instagram Publisher.

## Scenario identity and trigger

- Name: `Reel Production — Cloudinary Assembly`
- Live Make scenario ID: `6806011` (saved and disabled on 3 August 2026).
- Schedule: every 15 minutes while disabled; turn it on only after the single acceptance record succeeds.
- First module: `Airtable > Search Records`, using the existing `My Airtable OAuth connection`.
- Base: `Montanum Content OS` (`appGVBozOWqbxQSKW`); table: `Content` (`tblXri72m8ZKgBicu`).
- Limit: `1` (one paid TTS/render attempt per cycle).

Use this formula exactly:

```text
AND(
  {Post Type}="Reel",
  {Reel Production Status}="Brief Ready",
  {Rendering Readiness}="Ready",
  {Voice-over Script}!="",
  {Subtitle Script}!="",
  {Final Reel Asset}=""
)
```

`Brief Ready` is the only automatic entry state. A record with missing or unapproved media must remain `Needs Media`/`Needs Review` and never reach the formula above.

## Ordered modules

| # | Make module | Input / action | Airtable result |
| --- | --- | --- | --- |
| 1 | Airtable: Search Records | Find one eligible Content record using the formula above. | None. |
| 2 | OpenAI: Generate speech from text | Existing `My OpenAI connection`; model `gpt-4o-mini-tts`; voice `coral`; response format MP3; text = `Voice-over Script`. | No Airtable write yet. |
| 3 | Cloudinary: Upload a resource | Existing `My Cloudinary connection`; upload the binary from #2 as resource type `video`; public ID `reels/<Content record ID>/v<Reel Brief Version>/narration`. | No Airtable write yet. |
| 4 | Airtable: Update a Record | Write the Cloudinary `secure_url` to `Narration Asset` and set `Reel Production Status = Narration Ready`. | Prevents the source record from being selected again by the `Brief Ready` trigger. |
| 5 | Airtable: Search Records | Read only the record's linked Bundle Media in `Order` order. The saved module filters `ARRAYJOIN({Bundle})` by the current record's `Content Bundles[1]`. Fail if no source is a `res.cloudinary.com` delivery URL. | On failure: `Production Failed` with safe summary. |
| 6 | JSON / Tools / Text parser | Join each Brief `source_bundle_media_id` to the returned Bundle Media record ID and `File URL`; reject IDs outside this bundle. Convert approved subtitle segments to UTF-8 SRT using approved scene durations; do not invent media. | Keep SRT text and ordered Cloudinary source IDs in the run only. |
| 7 | Cloudinary: Upload a resource | Upload the SRT as resource type `raw`; public ID `reels/<Content record ID>/v<Reel Brief Version>/subtitles.en.srt`. | Store secure URL in `Subtitle Asset`. |
| 8 | Tools: Set variable | Build the delivery URL defined in `CLOUDINARY_REEL_ASSEMBLY.md`: normalize 1080×1920, splice the ordered source IDs, apply `ac_none`, then `l_audio`, `l_subtitles`, `f_mp4`. | No write. |
| 9 | HTTP: Make a request | `GET` the final Cloudinary URL once so Cloudinary generates the derived MP4. Require a 2xx response and `video/mp4`. | No write. |
| 10 | Airtable: Update a Record | Set `Final Reel Asset`, `Reel Duration Seconds`, `Reel Validation Summary`; set `Reel Production Status = Approval Required` and `Reel Approval Status = Pending Approval`. | Stops all production retries and creates the manual approval boundary. |
| 11 | Telegram: Send a Video | Send the final Cloudinary URL only to the owner review chat. | Preview only — never Instagram. |

### Saved live segment

The disabled scenario now saves the safe preparation segment (Make module labels 2–9): eligibility search, OpenAI `gpt-4o-mini-tts` (`coral`, MP3), Cloudinary narration upload, Content update, linked Bundle Media search, full `Scene Plan JSON` parsing, scene iteration, and per-scene Bundle Media record read by `source_bundle_media_id`. The final narration update writes `Narration Asset` from Cloudinary's `Secure URL` and sets `Reel Production Status` to `Narration Ready`, preventing a second scheduled pass from generating another narration. No module has run.

The Scene Plan parser uses the saved Make data structure `Reel Brief Scenes v1` and parses the actual top-level Brief object, then iterates its `scenes[]` array. It does **not** infer a scene from free text. The per-scene Bundle Media read is now followed by the saved filter `Scene media belongs to Content Bundle`: `Bundle Media.Bundle[1] = Content.Content Bundles[1]`. Only filtered records enter the Array Aggregator, which retains the durable `ID` and `File URL` for the later Cloudinary plan.

## Required field mapping

| Content field | Use |
| --- | --- |
| `Voice-over Script` | English source for OpenAI TTS. |
| `Subtitle Script` / approved `Scene Plan JSON` | Source for SRT text and timed captions. `Scene Plan JSON` is also the authoritative `source_bundle_media_id` join input. |
| `Content Bundles` → `Bundle Media` | Ordered visual assets. |
| `Reel Brief Version` | Part of deterministic Cloudinary public IDs and retry identity. |
| `Narration Asset`, `Subtitle Asset`, `Final Reel Asset` | Cloudinary `secure_url` values only. |
| `Reel Production Status`, `Reel Approval Status` | State-machine boundary; never use generic `Status` to trigger rendering. |

## Failure path

Every module after #2 has an error handler that updates the same Content record with:

```text
Reel Production Status = Production Failed
Reel Production Error = concise safe message
Reel Approval Status = Not Requested
```

It must not include an API key, Telegram token, temporary Airtable attachment URL or raw provider response. A retry begins only after a human resets the record to `Brief Ready` and fixes the media/brief.

## SRT / transformation-code decision

The remaining deterministic step needs cumulative scene timing and a Cloudinary URL with an arbitrary number of splice layers. Make's basic aggregators cannot safely calculate both from the validated scene array alone. The official Make **Code** module runs that small JavaScript transformation inside this existing scenario and consumes Make Code credits. The owner approved it on 3 August 2026; the module is now saved after the validated Array Aggregator. The scenario itself remains inactive and has not been run.

The saved module receives the Content record's `Scene Plan JSON`, the validated `Bundle Media` array, and the generated narration URL. It derives the narration folder/public ID and returns `srt`, a base64 SRT data URI, `subtitlesPublicId`, `finalReelUrl`, and `expectedDurationSeconds`. It must not call OpenAI, Cloudinary, Telegram, or Instagram itself. The following standard modules will upload the returned SRT as `raw` and request the returned final Cloudinary URL.

### Current Cloudinary connector limitation

The available Make Cloudinary **Upload a Resource** module exposes only `image` and `video` resource types; it cannot upload the required SRT as Cloudinary `raw`. Do not upload the SRT as video: `l_subtitles` requires a raw `.srt` asset. The safe next integration is an HTTP request to Cloudinary's raw upload endpoint, using an unsigned upload preset restricted to SRT files. Creating that preset is an account-level Cloudinary action and is the only remaining manual setup item before the branch can be fully wired.

## One-record acceptance test

1. Create or select a dedicated test Content record with real, approved Cloudinary source media and status `Brief Ready` / readiness `Ready`.
2. Run the disabled scenario once. This single action is expected to use OpenAI TTS and create Cloudinary derived media.
3. Verify the final URL returns `video/mp4`, is 1080×1920, has narration, shows English subtitles, and is attached to the test Content record with `Approval Required / Pending Approval`.
4. Verify no generic `Status`, calendar entry, Instagram action or Publisher scenario was changed.
5. Only after the owner manually approves the preview may the existing publishing branch later be extended for a Reel-specific route.
