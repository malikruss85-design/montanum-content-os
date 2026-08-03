# Engine Production Security

## Implemented engine safeguards

- Production mode refuses to start without `MPE_API_TOKEN`.
- All `/v1/*` production endpoints require Bearer authentication. `/health` and `/ready` expose no job or asset data.
- Optional outbound callbacks require callback URL, Bearer token, and HMAC signing secret together.
- Callback headers include timestamp and HMAC SHA-256 signature over timestamp plus body.
- Request size, headers timeout, request timeout, and shutdown timeout are configurable and validated.
- The container runs as a non-root user and binds locally in Compose verification.
- FFmpeg is checked before the server marks itself ready.
- Logs exclude credentials; implementation must continue to avoid recording raw authorization headers or provider secrets.

## Required deployment controls

- Terminate HTTPS at a managed ingress/reverse proxy and redirect HTTP to HTTPS.
- Store API/callback tokens in the hosting secret manager, not image layers, `.env` files, Make mapper text, Airtable, or logs.
- Use a long random API token and rotate it on a schedule or suspected exposure.
- Restrict public ingress to Make's documented egress IPs if feasible; otherwise enforce rate limits/WAF at the edge.
- Configure a request/body limit at both edge and engine; do not send raw media through this JSON API.
- Back up run metadata and durable output storage; define retention/deletion rules for client media.
- Monitor readiness failures, authentication failures, render failures, disk consumption, and callback delivery failures.

## Deliberate limitations

This local MVP has no user identity system, TLS server, database encryption, rate limiter, storage provider, or secret manager. Those are deployment-platform responsibilities to complete before a public endpoint is enabled.
