# Local Test Instructions

## Run the non-render tests

From `media-production-engine`:

```powershell
node --test test/contracts.test.js test/idempotency.test.js test/approval.test.js
```

## Run full local assembly test

1. The isolated engine includes a project-local FFmpeg development dependency; no system-wide install is used.
2. Set its executable path for the current PowerShell session:

```powershell
$env:MPE_FFMPEG_PATH = (Resolve-Path 'node_modules\ffmpeg-static\ffmpeg.exe').Path
```

3. Run:

```powershell
node --test
```

The fixture creates a colour/test-video source and a still-image source locally, builds a two-scene Reel, adds mock silent narration and burned-in subtitles, and verifies the resulting MP4 is 1080×1920 with a positive duration.

## Run the local API

```powershell
$env:MPE_FFMPEG_PATH = (Resolve-Path 'node_modules\ffmpeg-static\ffmpeg.exe').Path
node src/server.js
```

Check `http://127.0.0.1:4317/health`. Keep `MPE_API_TOKEN` empty only for local development; set it before accepting commands beyond localhost.

No test or command contacts Make, Airtable, Telegram, Instagram, or a real AI/TTS provider.
