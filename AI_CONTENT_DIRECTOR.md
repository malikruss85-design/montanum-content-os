# AI Content Director

## Role

The AI Content Director is the editorial planning layer between an existing completed Content Bundle and the Scene Director. It reads the full bundle as one package and prepares an actionable media brief. It does not render media, call TTS, create publishing records, or modify the Telegram Collector.

## Inputs

- Existing Content Bundle identity and its linked Bundle Media, preserving order.
- User text and voice transcript.
- Existing project context and existing Content record editorial fields when available.
- Media metadata: media type, duration/dimensions where known, source filename/URL, and rights/approval status.
- Target channel/profile: initially Instagram Reel (vertical 9:16); future profiles may represent LinkedIn video, YouTube Shorts, TikTok, presentation film, and other defined destinations.

## Required decisions

For each requested production, the director returns:

- content angle;
- target format/profile;
- source-media strategy;
- narration strategy;
- target duration;
- intended number of scenes;
- whether original source media is sufficient;
- whether generated media could be required in a later phase;
- Reel topic, hook, full editorial script, voice-over script, caption, CTA, and hashtags;
- a structured scene brief suitable for editable typed Scene entities.

## Source-media strategy values

| Value | Meaning |
| --- | --- |
| `original_video` | Use original user video clips as primary visual sources. |
| `original_stills` | Use photos/renders as still scenes with permitted motion. |
| `mixed_original` | Combine original video and still assets. |
| `voice_led` | Narration leads; visuals use allowed original assets. |
| `generated_media_candidate` | Original material is insufficient; generation may be proposed for future approval. |
| `needs_input` | The Bundle lacks usable/approved source media. |

For the MVP, only the first four strategies are executable. `generated_media_candidate` is planning information only and must not trigger AI generation.

## Structured output contract

```json
{
  "content_angle": "",
  "target_profile": "instagram_reel_9x16",
  "source_media_strategy": "mixed_original",
  "narration_strategy": "single_voice_over",
  "target_duration_seconds": 45,
  "scene_count": 6,
  "original_media_sufficient": true,
  "generated_media_requirement": "not_required",
  "reel_topic": "",
  "hook": "",
  "reel_script": "",
  "voice_over_script": "",
  "caption": "",
  "cta": "",
  "hashtags": "",
  "scene_briefs": []
}
```

`scene_briefs` are inputs to the Scene Director, not final media instructions. Every referenced source must be a real Bundle Media asset or the brief must request input. The output is validated before any scene entity is created.

## Operating sequence

1. Validate the Bundle is closed/ready and contains at least one authorized source or meaningful narration input.
2. Assemble a bundle manifest: all text/transcript context plus an ordered media inventory.
3. Analyze the entire package to identify the strongest story, not one idea per asset.
4. Select the current target profile and propose a duration/scene count that source media can support.
5. Produce structured editorial and scene-brief output.
6. Validate supported values, source references, duration range, and absence of unsupported generation requests.
7. Save the editorial fields to the existing Reel Content record and submit the scene briefs to the Scene Director.

## Editorial safety and approval

- The Director proposes; a user/editor approves the Reel brief before production begins.
- It may identify missing media or a future generation need, but cannot create generated media in the MVP.
- It must clearly distinguish observed facts from creative narration and must preserve project/context constraints from the Bundle and project records.
- A material brief revision creates a new version and invalidates dependent scene approval/production output.
