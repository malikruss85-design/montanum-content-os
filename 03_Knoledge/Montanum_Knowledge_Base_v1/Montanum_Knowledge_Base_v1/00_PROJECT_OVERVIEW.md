# Montanum Knowledge Base

## Purpose

This repository is the working knowledge base for Montanum Studio and the technical foundation for Montanum Content OS.

It is intended for use by:

- Codex
- ChatGPT
- Claude Code
- Cursor
- Make.com developers
- automation contractors
- Montanum team members

## Current priority

Phase 1 is to finish and launch the content engine before expanding into broader Brain, prospecting, CRM, or BIM-agent features.

Target production flow:

Telegram → Content Bundle → GPT → Airtable Content → Content Calendar → Instagram

The system must accept:

- voice notes
- text
- photographs
- renders
- videos
- documents
- project references

It must generate:

- content ideas
- captions
- carousels
- Reels
- Stories
- scene lists
- image prompts
- video prompts
- publication-ready content packages

## Core principle

Do not replace a working process merely because a more sophisticated architecture is possible.

First make the smallest complete production loop stable, observable, repeatable, and easy to control.

## Repository map

- `10_CONTENT_OS` — Telegram, Make, Airtable and pipeline architecture
- `20_CONTENT` — content strategy and formats
- `30_AI_GENERATION` — image and video-generation rules
- `40_ARCHITECTURE` — architectural and BIM knowledge
- `50_PROJECTS` — project-specific knowledge
- `60_BUSINESS` — positioning and client communication
- `70_DEVELOPMENT` — roadmap and implementation backlog
- `90_AI_RULES` — rules for Codex and other development agents

## Known existing system

The current system already includes:

- Airtable base named `Montanum Content OS`
- tables including Projects, Content, Content Bundles and Bundle Media
- Telegram content-collector scenarios in Make
- Cloudinary upload steps
- content-generator scenarios in Make
- GPT-based content writing
- fields for Caption, Carousel Slides, Reel Script and Stories
- status-based Airtable views
- an existing Instagram Brand Brain
