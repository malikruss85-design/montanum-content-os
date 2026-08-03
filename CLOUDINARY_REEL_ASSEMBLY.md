# Cloudinary Reel Assembly — selected production path

## Decision

The Reel MVP uses the existing **My Cloudinary connection** in Make (`dsmg07va6`) instead of a Render service. It also keeps the existing **My OpenAI connection**, **My Airtable OAuth connection**, Telegram Collector and manual approval boundary. No Render service, persistent disk or new hosting bill is required.

## What Cloudinary does

Cloudinary is the durable media store and video assembly provider. It creates a 1080×1920 MP4 from the already uploaded Bundle Media, then stores the final Reel, English narration and subtitle file under deterministic Reel folders. Make writes only the resulting public delivery URLs and production state to Airtable.

Cloudinary supports all MVP operations needed here:

- resize/crop source footage to 9:16;
- trim clips and concatenate clips with still images;
- add an OpenAI TTS MP3 as an audio layer, optionally removing source audio;
- burn captions from an uploaded SRT/WebVTT file;
- deliver the final derived MP4 by HTTPS URL.

Official references: [concatenating videos and images](https://cloudinary.com/documentation/video_concatenation) and [video audio/subtitle layers](https://cloudinary.com/documentation/video_layers).

## Make scenario contract

Create one dedicated scenario named **Reel Production — Cloudinary Assembly**. It must be triggered only by a Content record that is brief-ready and explicitly queued for production. It must not touch the Telegram Collector, carousel routes or the existing Publisher route.

1. Read the linked Content, Content Bundle and ordered Bundle Media records.
2. Reject the run with `Needs Media` when there is no usable video or still asset. Never invent a visual asset.
3. Ask OpenAI for a concise English voice-over and subtitle text from the approved Reel Brief.
4. Use OpenAI TTS to create the English MP3. Upload it to Cloudinary as a `video` resource in `reels/<content-record-id>/narration/`.
5. Join each `source_bundle_media_id` in `Scene Plan JSON` to a Bundle Media record from the same Content Bundle. Use only its durable Cloudinary `File URL`; reject a missing or out-of-bundle ID. Build SRT from the approved scene caption segments and scene durations. The tested local command `npm run plan:cloudinary` outputs the exact UTF-8 SRT, so the Make route must preserve its timing convention. Upload it as a `raw` Cloudinary resource with public ID `reels/<content-record-id>/v<brief-version>/subtitles.en.srt` (the `.srt` extension is required by the subtitle layer).
6. Build a Cloudinary transformation from the ordered source public IDs:
   - normalize each asset to `1080x1920` before splicing;
   - trim video scenes to their approved start/end offsets;
   - splice still images for their approved durations;
   - replace or mute original audio and layer the narration MP3;
   - apply the SRT subtitle layer at the bottom;
   - request a final MP4 rendition.
7. Force Cloudinary to generate the derived rendition, then record its final HTTPS URL, subtitle URL, duration and validation result in Airtable.
8. Set the Content record to **Approval Required / Pending Approval** and send the preview to Telegram. Do not create a publication or call Instagram.

## Exact delivery transformation contract

The Cloudinary delivery URL is the final assembly instruction; it does not require a Render API. The repository includes a tested reference builder at `media-production-engine/src/services/cloudinary-reel-url.js`. Make must generate an equivalent URL from the ordered approved scene assets.

For a still-image first scene, the delivery path starts with `image/upload`. The final `f_mp4` instructs Cloudinary to make a video; this is how a photo-only Reel is supported. Every later scene is appended with `fl_splice`, video scenes retain their approved `so`/`eo` trim points, `ac_none` removes original sound, and the generated OpenAI narration is layered back as `l_audio`. The final layer is the uploaded English SRT file.

Example shape (public IDs are illustrative):

```text
https://res.cloudinary.com/<cloud>/image/upload/
ac_none,c_fill,g_auto,h_1920,w_1080,du_6/
l_video:telegram:file_99,c_fill,g_auto,h_1920,w_1080,so_2,eo_6/fl_layer_apply,fl_splice/
l_audio:reels:<content-id>:v1:narration/fl_layer_apply/
l_subtitles:reels:<content-id>:v1:subtitles.en.srt/fl_layer_apply/
f_mp4/telegram/file_98.mp4
```

The scenario must never treat an Airtable attachment URL as a durable source ID. It first reads the existing Cloudinary delivery URL from ordered Bundle Media, derives the Cloudinary public ID, and writes final URLs back to these existing Content fields: `Narration Asset`, `Subtitle Asset`, `Final Reel Asset`, `Reel Duration Seconds`, `Reel Validation Summary`, `Reel Production Status` and `Reel Approval Status`.

### Brief-to-media join contract

`Scene Plan JSON` references media by `source_bundle_media_id`, while Airtable's `Bundle Media` table holds the durable URL. Before building a delivery URL, create one ordered scene for every Brief item:

| Brief field | Bundle Media / Cloudinary result |
| --- | --- |
| `source_bundle_media_id` | Match to the Bundle Media record ID from the same linked Content Bundle. |
| `source_asset_type` | `original_photo`/`render` must resolve to Cloudinary `image`; `original_video` must resolve to `video`. |
| `duration_seconds` | Still duration; for a video with no explicit trim, use `so_0,eo_<duration_seconds>`. |
| `trim_start_seconds`, `trim_end_seconds` (optional) | Explicit video trim, when the approved brief contains them. |
| `subtitle_segment` | One SRT cue with accumulated scene timing. |

`media-production-engine/src/services/cloudinary-reel-input.js` and `npm run plan:cloudinary` implement and test this join locally. Make must reproduce the result before its Cloudinary upload/transformation modules execute.

## Approval and publishing boundary

The existing Airtable calendar remains the source of truth for timing. Only a human changing the completed Reel record to `Approve` may advance it to `Scheduled`; only then may the existing Publisher be extended with a dedicated Reel route that uses **Final Reel Asset URL**. A failed or unapproved Reel can never enter the publishing path.

## Asset naming and retry safety

Use a production request ID such as `<content-record-id>:v<brief-version>` in every Cloudinary folder/public ID. Before a retry, look for an existing final asset for that exact ID. Reuse it only when the source-media version, narration script and subtitle version match; otherwise increment the version. This prevents duplicate TTS calls and duplicate final assets.

## Scope explicitly excluded from this pass

- ElevenLabs and voice cloning;
- automatic publishing;
- music, advanced transitions, generated video and invented visuals;
- changing non-Reel scenarios.
