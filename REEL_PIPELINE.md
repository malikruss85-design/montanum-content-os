# Reel Pipeline

## End-to-end operating sequence

1. **Collect input.** The user sends one or more videos with optional photos, renders, text, and voice notes. The existing Telegram Collector stores every item in one existing Content Bundle.
2. **Close the Bundle.** The existing collector's current completion action marks the Bundle ready for analysis. No Reel-specific replacement collector is introduced.
3. **Understand the whole Bundle.** GPT receives the Bundle's text, voice transcript, ordered video/photo/render references, and relevant project context. The request treats them as one story package, not independent posts.
4. **Create Reel editorial package.** For a selected Reel Content record, GPT returns validated structured output: Reel topic, hook, complete Reel script, voice-over script, caption, CTA, hashtags, and scene plan.
5. **Queue production.** A Reel Production scenario assigns a production request ID and changes `Reel Production Status` to `Queued`. It performs no work if the same record/request is already active or preview-ready.
6. **Generate narration.** The scenario submits the Voice-over Script to the provider-neutral TTS adapter. On success it saves narration and moves to `Narration Ready`; on failure it records `Production Failed` with a retryable error.
7. **Create subtitles.** The assembly service uses the final voice-over text/audio to create a timed subtitle file. The output is stored on the Content record.
8. **Assemble the Reel.** The assembler combines ordered original videos, optional photos/renders, narration, subtitles, and only explicitly requested transitions/intro/outro. It outputs a 9:16 MP4 and reports duration.
9. **Validate output.** Before preview status, verify that the final file exists, has vertical Reel dimensions, includes the required narration/subtitles, and uses source media defined in the scene plan. If it fails, set `Production Failed`; do not send a preview.
10. **Send preview.** Store the final Reel and subtitle file in Airtable, set `Preview Ready` then `Approval Required`, and notify the user in Telegram with a preview link/file and the approval action.
11. **Manual approval.** The user approves or requests revision. Approval records actor/time and changes status to `Approved for Publishing`. A revision returns the item to editorial work and invalidates the old approval.
12. **Publish.** The existing Instagram Publisher gains a Reel-specific route in a later approved implementation. It reads only `Approved for Publishing` Reel records with a Final Reel, posts the final asset, saves Instagram receipt data, and sets `Published` only on confirmed success.

## GPT output contract

```json
{
  "reel_topic": "",
  "hook": "",
  "reel_script": "",
  "voice_over_script": "",
  "caption": "",
  "cta": "",
  "hashtags": "",
  "scene_plan": []
}
```

Validation before Airtable write:

- all eight keys are present;
- `scene_plan` is a JSON array with at least one source-media reference;
- all source-media references belong to the linked Bundle;
- voice-over text is non-empty;
- title, hook, caption, CTA, and hashtags follow existing Montanum brand rules;
- no output is automatically published.

## Production state transitions

| From | Action | To | Required evidence |
| --- | --- | --- | --- |
| Brief Ready | Start production | Queued | New request ID |
| Queued | TTS accepted | Narration Generating | TTS job ID |
| Narration Generating | Audio returned | Narration Ready | Narration asset URL |
| Narration Ready | Render submitted | Assembly Rendering | Assembly job ID |
| Assembly Rendering | Valid render returned | Preview Ready | Final Reel + subtitle file |
| Preview Ready | Preview sent | Approval Required | Telegram preview timestamp |
| Approval Required | User approves | Approved for Publishing | Approver and timestamp |
| Approved for Publishing | Instagram success | Published | Instagram Reel ID/permalink |
| Any active state | Recoverable error | Production Failed | Error and stage |

## Failure and retry behaviour

- TTS/assembly timeout or provider error: retain script and source links, write the error, and allow retry using the same record with a new attempt/request ID.
- Missing or unsupported source media: stop before TTS/assembly and mark the Content record `Production Failed` with a request for input.
- Invalid GPT JSON or invalid scene source: keep the Content record in editorial status; do not create a production request.
- Telegram preview failure: final Reel remains stored; record the failure and retry notification without re-rendering.
- Instagram failure: retain `Approved for Publishing`, store the provider error, and do not mark Published.

## First production constraints

- Use one narration track and one subtitle language per Reel.
- Source clips must have a defined order and explicit trim/hold durations in the scene plan.
- Transition, intro, and outro default to disabled. Enable only through explicit fields in the approved scene plan.
- Do not auto-generate new visual assets in this phase.
