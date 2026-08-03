# Video Generation

## Objective

Turn approved architectural images and project media into controlled cinematic clips without architectural drift.

## Current preferred use cases

- slow cinematic architecture shots
- drone and helicopter-style movements
- project reveal
- before-and-after
- construction timelapse
- scene activation with people
- vertical Reels

## Standard camera rule

Create one continuous shot.

Do not create a second scene.

Do not duplicate, mirror, loop or restart the environment.

No teleportation, cuts, interpolation jumps or sudden acceleration.

## Camera-lock rule

When matching two reference frames:

- camera height remains constant
- focal length remains constant
- distance remains constant
- framing remains nearly identical
- only the specified movement is allowed

## Environment-lock rule

Architecture, landscape, furniture, vegetation, lighting, weather and static objects remain unchanged unless explicitly requested.

## Natural motion

Permitted when appropriate:

- palm movement
- subtle vegetation motion
- ocean waves
- clouds
- people walking
- staff serving
- construction activity
- minor parallax

## Construction timelapse stages

1. virgin land
2. survey and site marking
3. earthworks
4. foundation start
5. foundations continue
6. structural frame
7. near-complete site
8. final finished result

## Provider strategy

The system should support a provider abstraction instead of hard-coding one model.

Possible providers:

- Seedance
- Kling
- Runway
- Veo
- other API-based engines
- manual-generation queue for web-only tools

## Manual fallback

When no API exists, create a complete manual job containing:

- source image
- end image where relevant
- positive prompt
- negative prompt
- aspect ratio
- duration
- provider
- expected camera movement
- Airtable record ID
