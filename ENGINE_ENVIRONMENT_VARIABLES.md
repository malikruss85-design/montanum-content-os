# Engine Environment Variables

The local development default uses Mock TTS. Production Reel narration uses OpenAI TTS only when the provider variables below are configured in the hosting secret manager.

| Variable | Required | Local default | Purpose |
| --- | --- | --- | --- |
| `MPE_PORT` | No | `4317` | HTTP server port. |
| `MPE_HOST` | No | `127.0.0.1` | Bind address; local-only by default. |
| `MPE_ENV` | No | `development` | Set to `production` in a deployed container; validates production safeguards. |
| `MPE_API_TOKEN` | Yes in production | Empty | Bearer token required by all `/v1/*` endpoints. |
| `MPE_CALLBACK_URL` | No | Empty | Future authenticated Make callback URL. |
| `MPE_CALLBACK_TOKEN` | Required if callback URL set | Empty | Bearer token sent with Engine callbacks. |
| `MPE_CALLBACK_SIGNING_SECRET` | Required if callback URL set | Empty | HMAC secret used to sign Engine callbacks. |
| `MPE_DATA_DIR` | No | `./data` | Local run/asset persistence directory. |
| `MPE_LOG_DIR` | No | `./logs` | Structured log directory. |
| `MPE_OUTPUT_DIR` | No | `./output` | Final/intermediate local render directory. |
| `MPE_FFMPEG_PATH` | Yes for rendering | `ffmpeg` from `PATH` | Project-local FFmpeg executable path. |
| `MPE_FFPROBE_PATH` | No | inferred from FFmpeg path or `ffprobe` | Probe executable used for render validation. |
| `MPE_TEST_AUDIO_PATH` | No | Empty | Optional narration audio file used by Mock TTS. |
| `MPE_TTS_PROVIDER` | No | `mock` (or `openai` if an OpenAI key is present) | Selects the narration adapter. Use `openai` for the working Reel voice. |
| `OPENAI_API_KEY` | Yes for OpenAI TTS | Empty | OpenAI API key held only in the deployment secret manager. |
| `OPENAI_TTS_MODEL` | No | `gpt-4o-mini-tts` | OpenAI speech model for English narration. |
| `OPENAI_TTS_VOICE` | No | `coral` | OpenAI English voice. Change this later when the preferred voice is chosen. |
| `MPE_MAX_REQUEST_BYTES` | No | `2000000` | Maximum JSON command body size. |
| `MPE_REQUEST_TIMEOUT_MS` | No | `30000` | Request and future callback timeout. |
| `MPE_HEADERS_TIMEOUT_MS` | No | `35000` | Maximum HTTP header read time. |
| `MPE_SHUTDOWN_TIMEOUT_MS` | No | `10000` | Graceful shutdown deadline. |

Never commit provider keys or copy them into Airtable, Make fields, logs, or the repository.
