# Engine Local Setup

## Prerequisites

1. Node.js 24 or later.
2. A project-local FFmpeg build for rendering tests. The isolated engine includes `ffmpeg-static` as a development dependency; it is downloaded to `media-production-engine/node_modules/ffmpeg-static/ffmpeg.exe` and remains outside version control. Alternatively, set `MPE_FFMPEG_PATH` to another project-local binary. Do not install it system-wide for this engine.

## Run locally

From `media-production-engine`:

```powershell
$env:MPE_FFMPEG_PATH = (Resolve-Path 'node_modules\ffmpeg-static\ffmpeg.exe').Path
node src/server.js
```

The health check is then available at `http://127.0.0.1:4317/health`.

To run the test suite:

```powershell
$env:MPE_FFMPEG_PATH = (Resolve-Path 'node_modules\ffmpeg-static\ffmpeg.exe').Path
node --test
```

If FFmpeg is unavailable, contract/idempotency/approval tests still run; the render integration test reports a clear skipped result. Provide a project-local binary before treating the renderer as verified.

## Security

- The server binds to localhost by default.
- Configure `MPE_API_TOKEN` before exposing a non-health endpoint outside the local machine.
- Keep FFmpeg, local data, logs, output, and any future secrets out of source control.
- With the default Mock TTS it does not contact external providers or publish media. Setting `MPE_TTS_PROVIDER=openai` and an `OPENAI_API_KEY` enables OpenAI narration; it still never publishes directly to Instagram.
