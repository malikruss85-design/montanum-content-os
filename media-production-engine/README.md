# Montanum Media Production Engine

Optional local fallback engine for assembling a reviewed Instagram Reel from original source media, narration, subtitles, and simple cuts. Production MVP assembly uses Cloudinary through Make; this engine remains useful for controlled local tests and future compositions beyond Cloudinary transformations.

## OpenAI TTS

Set these only in the engine environment (never in Git):

```text
MPE_TTS_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=coral
```

Without those variables the development engine keeps using its mock voice for local tests.

## Cloudinary planning helper

The production route remains Make + Cloudinary, but the repository includes a deterministic local helper for validating the same asset inputs before a Make acceptance run. It creates the final delivery URL and a scene-timed SRT without contacting OpenAI or Cloudinary:

```powershell
'{"narrationPublicId":"reels/rec123/v1/narration","subtitlesPublicId":"reels/rec123/v1/subtitles.en.srt","scenes":[...]}' |
  npm run plan:cloudinary
```

Every scene must reference a durable `https://res.cloudinary.com/.../upload/...` URL, use the approved `sequence`, and include either `stillDuration` (photo/render) or `trimStart`/`trimEnd` (video). Include the approved `subtitleSegment` for each scene to produce an SRT suitable for Cloudinary's `l_subtitles` layer. The raw subtitle public ID must end in `.srt` or `.vtt`.

The helper also accepts the actual Reel Brief and Airtable bundle-media shape. It joins `source_bundle_media_id` to the selected Bundle Media record's `File URL`, rejects IDs outside that bundle, and translates `duration_seconds` into photo holds or video trims. This is the exact data join the remaining Make modules must perform:

```powershell
'{"narrationPublicId":"reels/rec123/v1/narration","subtitlesPublicId":"reels/rec123/v1/subtitles.en.srt","scenePlan":[...],"bundleMedia":[{"id":"recMedia","fields":{"File URL":"https://res.cloudinary.com/..."}}]}' |
  npm run plan:cloudinary
```

## Source media and final assets

Scenes can use local paths for development or approved HTTPS source URLs. The local fallback permits existing Cloudinary source URLs only (`res.cloudinary.com`), downloads them into the persistent run directory, and refuses unapproved hosts. Do not deploy this service for the current MVP; follow `CLOUDINARY_REEL_ASSEMBLY.md` for the production path.

See the project-root engine documents for architecture, setup, and the staged implementation scope.
