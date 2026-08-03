# Engine Deployment Options

## Required deployment characteristics

The engine needs a container-compatible runtime with FFmpeg, durable storage for runs/logs/output, an authenticated HTTPS endpoint, a stable public hostname, and a reverse proxy or platform ingress that terminates TLS. It does not require a chosen cloud vendor for this phase.

## Suitable options

| Option | Fit | Notes |
| --- | --- | --- |
| Managed container platform | Best first production option | Runs the supplied Docker image, provides HTTPS ingress, persistent volume/object storage and environment-secret management. Select a provider later. |
| Small virtual machine with Docker Compose | Simple and economical | Requires explicit OS patching, reverse proxy/TLS, backups, monitoring, and storage maintenance. |
| Container orchestration platform | Later scale option | Appropriate only if workloads, concurrency, and operational team justify it. Not required for MVP. |
| Windows local machine with secure tunnel | Development/demo only | Useful for controlled testing but not a durable production service. |

## Recommended path

Use Docker Compose only for local verification, then deploy the unchanged container image to a managed container platform with a public HTTPS ingress. Place durable final assets in provider-neutral object storage before relying on containers that may be replaced.

## No decision made

No hosting vendor, region, storage provider, or tunnel provider is selected or connected by this work.
