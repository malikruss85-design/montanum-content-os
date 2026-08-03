# Airtable Structure

## Existing tables observed

- Projects
- Content
- Content Bundles
- Bundle Media

## Recommended Phase 1 tables

### Projects

Stores project context.

Core fields:

- Project Name
- Project Code
- Location
- Project Type
- Description
- Brand Story
- Active
- Reference Folder

### Content Bundles

Stores one raw input session.

Core fields:

- Bundle ID
- Status
- Telegram Chat ID
- User Message
- Voice Transcript
- Media Count
- Media Type
- Project
- GPT Status
- GPT Output
- Linked Content
- Created Time
- Last Updated
- Error

### Bundle Media

Stores each media file independently.

Core fields:

- Bundle
- Media Type
- Attachment
- Permanent URL
- Original Filename
- Order
- Telegram Message ID
- Width
- Height
- Duration
- Created Time

### Content

Stores the actual publication concept and generated content.

Core fields:

- Title
- Project
- Topic
- Status
- Content Category
- Post Type
- Priority
- Hook
- Angle
- CTA
- Caption
- Carousel Slides
- Reel Script
- Stories
- Media
- Publish Date
- Content Score
- Content Pillar
- Source Bundle
- Version

## Phase 2 tables

- Scripts
- Scenes
- Assets
- Generations
- Publications
- Errors
- Prompt Templates
- Providers
- Cost Log

## Status model

### Bundle Status

Collecting → Ready → Processing → Generated → Completed

Alternate outcomes:

Failed / Cancelled / Needs Input

### Content Status

Idea → Draft → Review → Approved → Media Production → Ready to Publish → Scheduled → Posted

## Rule

Airtable is the operational database and human-control surface.

It should not become the place where complex media-processing logic is implemented.
