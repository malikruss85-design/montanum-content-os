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

See the project-root engine documents for architecture, setup, and the staged implementation scope.
