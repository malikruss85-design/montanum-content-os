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
| 5 | Airtable: Search Records | Read the record's linked Bundle Media in `Order` order. Fail if no source is a `res.cloudinary.com` delivery URL. | On failure: `Production Failed` with safe summary. |
| 6 | Tools / Text parser | Convert the approved scene subtitle segments to a UTF-8 SRT. Timings must use approved scene durations; do not invent media. | Keep SRT text in the run only. |
| 7 | Cloudinary: Upload a resource | Upload the SRT as resource type `raw`; public ID `reels/<Content record ID>/v<Reel Brief Version>/subtitles.en`. | Store secure URL in `Subtitle Asset`. |
| 8 | Tools: Set variable | Build the delivery URL defined in `CLOUDINARY_REEL_ASSEMBLY.md`: normalize 1080×1920, splice the ordered source IDs, apply `ac_none`, then `l_audio`, `l_subtitles`, `f_mp4`. | No write. |
| 9 | HTTP: Make a request | `GET` the final Cloudinary URL once so Cloudinary generates the derived MP4. Require a 2xx response and `video/mp4`. | No write. |
| 10 | Airtable: Update a Record | Set `Final Reel Asset`, `Reel Duration Seconds`, `Reel Validation Summary`; set `Reel Production Status = Approval Required` and `Reel Approval Status = Pending Approval`. | Stops all production retries and creates the manual approval boundary. |
| 11 | Telegram: Send a Video | Send the final Cloudinary URL only to the owner review chat. | Preview only — never Instagram. |

### Saved live segment

The first safe segment is already saved in the disabled scenario: modules 2–5 currently implement the eligibility search, OpenAI `gpt-4o-mini-tts` (`coral`, MP3), Cloudinary narration upload, and Content update. The final update writes `Narration Asset` from Cloudinary's `Secure URL` and sets `Reel Production Status` to `Narration Ready`, preventing a second scheduled pass from generating another narration. No module has run.

## Required field mapping

| Content field | Use |
| --- | --- |
| `Voice-over Script` | English source for OpenAI TTS. |
| `Subtitle Script` / approved Media Scenes | Source for SRT text and timed captions. |
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

## One-record acceptance test

1. Create or select a dedicated test Content record with real, approved Cloudinary source media and status `Brief Ready` / readiness `Ready`.
2. Run the disabled scenario once. This single action is expected to use OpenAI TTS and create Cloudinary derived media.
3. Verify the final URL returns `video/mp4`, is 1080×1920, has narration, shows English subtitles, and is attached to the test Content record with `Approval Required / Pending Approval`.
4. Verify no generic `Status`, calendar entry, Instagram action or Publisher scenario was changed.
5. Only after the owner manually approves the preview may the existing publishing branch later be extended for a Reel-specific route.
