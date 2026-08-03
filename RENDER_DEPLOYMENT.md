# Render Deployment — Media Production Engine

The selected first production provider is Render. The root [render.yaml](render.yaml) defines a Docker web service in Singapore, a `/ready` health check, a 10 GB persistent disk at `/var/lib/mpe`, automatic deploys from `main`, and a generated engine API token.

## Deploy once

1. Sign in to [Render](https://dashboard.render.com/) with the GitHub account that can access `malikruss85-design/montanum-content-os`.
2. Select **New** → **Blueprint**, select this repository and confirm the detected `render.yaml`.
3. When Render requests `OPENAI_API_KEY`, paste the existing OpenAI Platform API key there. Do not paste it into GitHub, Make mapper fields, Airtable, or this repository.
4. Create the Blueprint and wait for `/ready` to report healthy.
5. Confirm the resulting HTTPS service URL matches `MPE_PUBLIC_BASE_URL`. It becomes the Make Engine base URL, for example `https://montanum-media-production-engine.onrender.com`.

## After the first healthy deploy

1. In Make, create the authenticated callback webhook.
2. In Render's Environment page add `MPE_CALLBACK_URL`, `MPE_CALLBACK_TOKEN`, and `MPE_CALLBACK_SIGNING_SECRET`; save and redeploy.
3. In Make secret storage, create the Engine bearer-token connection using Render's generated `MPE_API_TOKEN`. Make uses it both to start production and to download the final MP4/subtitle from the callback `downloadUrl` before placing the durable public copy into the existing media-storage flow.
4. Only then enable the Reel Production Starter and callback scenarios. The current Content Publisher remains unchanged until the Reel route is acceptance-tested.

Render builds Docker services from the repository Dockerfile, supports runtime secret environment variables and persistent disks. The disk is required because the engine stores production runs, temporary files and outputs under `/var/lib/mpe`; later we will move durable final assets to object storage. See the official [Docker deployment](https://render.com/docs/docker), [persistent disk](https://render.com/docs/disks), and [Blueprint reference](https://render.com/docs/blueprint-spec).
