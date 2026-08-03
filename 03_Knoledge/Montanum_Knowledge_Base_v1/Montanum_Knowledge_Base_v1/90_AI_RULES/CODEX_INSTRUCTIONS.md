# Instructions for Codex

## Mission

Finish Montanum Content OS incrementally without destroying working Make and Airtable behavior.

## First action

Read all documentation and source assets.

Do not modify files until an audit is complete.

## Required audit outputs

- CURRENT_SYSTEM_AUDIT.md
- CURRENT_ARCHITECTURE.md
- DUPLICATE_BLUEPRINTS.md
- AIRTABLE_GAPS.md
- SECURITY_REVIEW.md
- IMPLEMENTATION_PLAN.md

## Development rules

- preserve original exports
- never store secrets in the repository
- use `.env.example`
- document every environment variable
- prefer idempotent operations
- use structured JSON schemas
- validate AI outputs
- log all provider requests and failures
- keep Make scenarios simple
- move complex media logic into tested code
- do not add a database unless Airtable cannot meet the requirement
- do not introduce extra frameworks without a clear reason
- create rollback instructions
- test one end-to-end path before expanding features

## Security

Never expose:

- Telegram Bot Token
- OpenAI API key
- Airtable token
- Make API token
- Cloudinary secrets
- Instagram credentials

Connection IDs from exported blueprints are not credentials but should still be treated as internal metadata.

## Definition of done

A feature is complete only when:

- it works end to end
- failure is visible
- retry is possible
- duplicate execution is safe
- status is stored
- documentation is updated
- a non-developer can operate it
