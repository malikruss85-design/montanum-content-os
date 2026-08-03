# TTS Integration Next Step

Do not connect a provider until the following decisions are approved:

1. Select one provider after a documented comparison against `TTS_PROVIDER_REQUIREMENTS.md`.
2. Approve English and Russian stock voice samples for Montanum narration.
3. Define the consent, recording source, retention, access, and revocation policy before any founder-voice clone is created.
4. Approve preview workflow: generate a short narration preview first; user/editor selects or revises voice profile; only then final assembly begins.
5. Store credentials only in the engine deployment secret manager.

## Adapter implementation sequence

1. Keep `MockTtsAdapter` as default.
2. Add one provider adapter implementing the existing `synthesize` and `get_status` contract.
3. Return narration asset, provider job ID, duration, status, and safe error data.
4. Add an explicit `Voice Preview` production run before final assembly.
5. Do not alter Make/Airtable contracts; use `Voice Profile`, `Narration Language`, `Narration Asset`, and Production Run fields already specified.
