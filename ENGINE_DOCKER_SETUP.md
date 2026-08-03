# Engine Docker Setup

## Files

- `media-production-engine/Dockerfile` installs FFmpeg inside the image and runs the engine as a non-root Node user.
- `media-production-engine/docker-compose.yml` exposes the service only on `127.0.0.1:4317` and creates named persistent volumes for data, logs, and output.
- `media-production-engine/.env.example` documents required local Compose variables. Copy it to `.env` locally; never commit the real token.

## Local container verification

On a machine with Docker Desktop:

```powershell
cd 'C:\Users\malik\OneDrive\Desktop\Montanum Content OS\media-production-engine'
Copy-Item .env.example .env
# Set a unique MPE_API_TOKEN in .env. To use the live English voice, also set
# MPE_TTS_PROVIDER=openai and OPENAI_API_KEY in this local-only file.
docker compose up --build
```

Verify:

```powershell
Invoke-RestMethod http://127.0.0.1:4317/health
Invoke-RestMethod http://127.0.0.1:4317/ready
```

The container does not publish externally; its port binds only to localhost. Do not add a public ingress until an HTTPS, token, callback, and storage plan is approved.

## Persistent volumes

- `mpe-data`: file-backed production run records.
- `mpe-logs`: structured JSON-line logs.
- `mpe-output`: rendered previews and final assets for local verification.

For production, use managed persistent volumes only for temporary/job data; place durable output assets in approved object storage through a future storage adapter.
