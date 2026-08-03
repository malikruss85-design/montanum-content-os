# Telegram Bot

## Role

Telegram is the fastest input interface for the founder and team.

The bot should accept:

- text
- voice
- photo
- video
- document
- media groups
- commands and inline buttons

## Collection model

A user starts or implicitly opens one active Content Bundle.

All subsequent items are attached to that bundle until the user presses `Ready` or sends a finishing command.

## Required commands

- `/new` — start a new bundle
- `/ready` — close collection and start generation
- `/status` — show active jobs
- `/cancel` — cancel the active bundle
- `/help` — show available actions

## Approval buttons

- Approve
- Revise
- Generate images
- Generate video
- Regenerate scene
- Assemble final reel
- Ready to publish

## Required bot responses

Every action should return a short confirmation containing:

- Bundle ID
- detected content type
- number of media items
- current status
- next available action

## Known implementation

The current Make blueprint already includes:

- Telegram Watch Updates
- file download
- Cloudinary upload
- Airtable bundle lookup by Telegram Chat ID and Collecting status
- creation or update of Content Bundles
- creation of Bundle Media records

## Immediate technical checks

- media-group handling must not create multiple bundles
- duplicate Telegram update IDs must be ignored
- one chat must not have two unintended active bundles
- large files need explicit size handling
- voice transcription failures must not block photos and text
- Cloudinary and Airtable errors must be logged
