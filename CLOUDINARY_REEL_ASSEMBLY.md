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
5. Build SRT from the approved caption timings. Upload it as a `raw` Cloudinary resource in `reels/<content-record-id>/subtitles/`.
6. Build a Cloudinary transformation from the ordered source public IDs:
   - normalize each asset to `1080x1920` before splicing;
   - trim video scenes to their approved start/end offsets;
   - splice still images for their approved durations;
   - replace or mute original audio and layer the narration MP3;
   - apply the SRT subtitle layer at the bottom;
   - request a final MP4 rendition.
7. Force Cloudinary to generate the derived rendition, then record its final HTTPS URL, subtitle URL, duration and validation result in Airtable.
8. Set the Content record to **Approval Required / Pending Approval** and send the preview to Telegram. Do not create a publication or call Instagram.

## Approval and publishing boundary

The existing Airtable calendar remains the source of truth for timing. Only a human changing the completed Reel record to `Approve` may advance it to `Scheduled`; only then may the existing Publisher be extended with a dedicated Reel route that uses **Final Reel Asset URL**. A failed or unapproved Reel can never enter the publishing path.

## Asset naming and retry safety

Use a production request ID such as `<content-record-id>:v<brief-version>` in every Cloudinary folder/public ID. Before a retry, look for an existing final asset for that exact ID. Reuse it only when the source-media version, narration script and subtitle version match; otherwise increment the version. This prevents duplicate TTS calls and duplicate final assets.

## Scope explicitly excluded from this pass

- ElevenLabs and voice cloning;
- automatic publishing;
- music, advanced transitions, generated video and invented visuals;
- changing non-Reel scenarios.
