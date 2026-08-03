# Make Automations

## Existing scenario families

1. Telegram Bot — Content Collector
2. Montanum Content Generator
3. Montanum Content Writer — Idea to Approved
4. Montanum Content Writer — Approved

Multiple numbered copies exist and must be treated as versions until audited.

## Audit rules

Do not delete older blueprints before:

- comparing module count
- comparing filters
- comparing Airtable table IDs
- comparing prompts
- checking the latest modified date
- checking whether the live scenario uses that version

## Recommended scenario split

### Scenario A — Telegram Collector

Receives and stores raw input.

### Scenario B — Bundle Finalizer

Marks a bundle Ready and validates that it contains usable input.

### Scenario C — Content Generator

Converts one Ready bundle into structured content.

### Scenario D — Approval Handler

Receives Telegram approval or revision.

### Scenario E — Calendar and Publishing

Moves approved records into scheduling and publication.

### Scenario F — Error and Recovery

Retries jobs and sends human-readable failure notices.

## Make design standards

- one scenario, one responsibility
- explicit status changes
- no hidden reliance on manual Airtable edits
- no hard-coded record IDs unless documented
- every external request gets an error handler
- every record has a traceable Bundle ID
- every scenario should be safe to run twice
- secrets remain in connections or environment storage
