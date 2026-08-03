# Montanum Media Production Engine

Local MVP engine for assembling a reviewed Instagram Reel from original source media, narration, subtitles, and simple cuts. It supports OpenAI TTS when configured; Make, Airtable, Telegram, and Instagram handoffs remain the next integration layer.

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

Scenes can use local paths for development or approved HTTPS source URLs. The production default permits existing Cloudinary source URLs only (`res.cloudinary.com`), downloads them into the persistent run directory, and refuses unapproved hosts. Callback assets include an authenticated `downloadUrl`; Make downloads the MP4/subtitle with the engine token and places the durable public copy in the existing media-storage flow.

See the project-root engine documents for architecture, setup, and the staged implementation scope.
