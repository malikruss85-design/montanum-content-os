# TTS Provider Requirements

## Current decision

Mock TTS remains the default. No provider is selected, connected, or credentialed.

## Required capabilities

| Requirement | Stock voice MVP | Future founder voice |
| --- | --- | --- |
| English narration | Required | Required |
| Russian narration | Required | Required |
| Voice preview before render | Required | Required |
| Provider API / asynchronous job support | Required | Required |
| Stable provider job/result ID | Required | Required |
| WAV/MP3 output, duration, sample rate | Required | Required |
| Adjustable pacing/pronunciation where supported | Preferred | Required |
| Commercial usage rights | Required | Required |
| Data retention/deletion controls | Required | Required |
| Consent and voice-rights controls | N/A | Mandatory |
| Provider-neutral adapter fit | Required | Required |

## Evaluation criteria

Evaluate potential providers against natural architecture/business narration, English and Russian quality, stock voice availability, controlled founder-voice cloning, API reliability, preview latency, audio controls, output licensing, privacy/retention, regional availability, cost per minute, rate limits, and operational support.

## Voice profile model

- `stock_en_default`: initially selected English stock voice after a future decision.
- `stock_ru_default`: initially selected Russian stock voice after a future decision.
- `montanum_founder_en`: future consented founder voice profile.
- `montanum_founder_ru`: future consented founder voice profile if appropriate.

Voice profile keys are provider-neutral. Provider-specific voice IDs remain adapter configuration, never Airtable/Make public data.
