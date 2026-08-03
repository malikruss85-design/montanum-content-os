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

## Source media and final assets

Scenes can use local paths for development or approved HTTPS source URLs. The local fallback permits existing Cloudinary source URLs only (`res.cloudinary.com`), downloads them into the persistent run directory, and refuses unapproved hosts. Do not deploy this service for the current MVP; follow `CLOUDINARY_REEL_ASSEMBLY.md` for the production path.

See the project-root engine documents for architecture, setup, and the staged implementation scope.
