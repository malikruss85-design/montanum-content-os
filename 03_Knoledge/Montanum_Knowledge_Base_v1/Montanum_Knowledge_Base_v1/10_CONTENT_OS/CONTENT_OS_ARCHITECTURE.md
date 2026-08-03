# Montanum Content OS Architecture

## Production objective

Create a stable system that turns raw founder input and project media into approved publication-ready content.

## Canonical flow

Telegram  
→ Make content collector  
→ Airtable Content Bundle  
→ media storage  
→ GPT content generation  
→ Airtable Content record  
→ approval  
→ scene and asset production  
→ final assembly  
→ content calendar  
→ publication

## Existing components

### Telegram content collector

The existing Make scenario uses Telegram `Watch Updates`, routes different content types, downloads files and uploads media to Cloudinary.

### Content Bundles

A content bundle groups one user instruction with all media sent during one collection session.

Known fields include:

- Bundle ID
- Status
- Telegram Chat ID
- User Message
- Voice Transcript
- Media
- Media Count
- Media Type
- Created Time
- Last Updated
- Linked Content
- Bundle Media
- GPT Status
- GPT Output
- Content Generated
- Project

### Content Generator

The generator searches for a recent bundle where:

- Status = Ready
- GPT Status is not Done

It then generates content and writes results into Airtable.

### Content table

Known fields include:

- Title
- Project
- Topic
- Status
- Content Category
- Post Type
- Priority
- Hook
- One-sentence content angle
- CTA
- Publish Date
- Publish Month
- Media
- Content Score
- Content Pillar
- Content Bundles
- Caption
- Carousel Slides
- Reel Script
- Stories

## Recommended responsibility split

### Make should handle

- Telegram triggers
- routing
- simple transformations
- Airtable reads and writes
- webhook calls
- notifications
- status transitions
- retries for simple API calls

### Custom code should handle

- structured JSON validation
- complex scene generation
- media processing
- FFmpeg assembly
- subtitles
- audio mixing
- video-quality checks
- provider abstraction for multiple image and video APIs
- robust job polling
- cost tracking
- idempotency and duplicate prevention

## First stable release

The first complete release should stop after:

1. Telegram receives voice, text and media.
2. A Content Bundle is created.
3. GPT creates structured content.
4. A Content record is created.
5. Telegram returns a preview.
6. User can approve or request revision.
7. Approved content appears in the calendar.

Video generation is added only after this loop is stable.
