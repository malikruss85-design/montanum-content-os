# Make Scenario Recommendations

## Decision summary

The working Telegram Collector must remain enabled and unchanged for this planning phase. The existing carousel pipeline should remain enabled and isolated. Reel production is added as a new, separate scenario family after approval; it must not be added as new routes inside the Collector or Cover Generator.

Because the repository contains exports rather than live Make state, “enabled” below means the recommended live operational role. Confirm live schedules and versions before any future activation/deactivation.

| Existing scenario | Recommendation | Reason |
| --- | --- | --- |
| Telegram Bot - Content collector | **Remain enabled.** Preserve its successful single-Bundle collection behaviour. | It is the accepted intake path and contains the working Bundle logic. Reel work begins only after a Bundle is ready. |
| Content Generator | **Remain enabled, but use one canonical Bundle-to-Content path.** | It is the appropriate point for whole-Bundle analysis and Reel Content creation. It requires targeted extension later to understand video/text/voice/mixed Bundles. |
| Content Writer - Approved to Written | **Remain enabled for existing content and extend carefully for Reels later.** | It already writes Reel Script/Caption/Hashtags/Stories. A Reel-specific structured output should be added without changing carousel output behaviour. |
| Scheduler - Written to Scheduled | **Remain enabled for existing carousel/feed behaviour. Do not route Reels through it until Reel approval states are implemented.** | Reels must not schedule/publish merely because they are written; final asset and manual approval are mandatory. |
| Cover Generator | **Remain enabled and unchanged.** | It is carousel-specific and has no role in Reel assembly. |
| Instagram Publisher | **Remain enabled for existing feed/carousel routes. Keep Reel publishing disabled until a new approval-gated Reel route is tested.** | The exported publisher has no Reel route and should never publish an unapproved source clip. |

## New scenarios for the Reel phase

| New scenario | Trigger | Does | Does not do |
| --- | --- | --- | --- |
| Reel Brief Generator | Content record is selected/approved for Reel writing | Generates and validates Reel topic, scripts, voice-over, caption, CTA, hashtags, and scene plan from its Bundle | TTS, assembly, publishing |
| Reel Production Orchestrator | Reel Content status = Brief Ready / Queued | Creates one request ID, calls TTS adapter and assembly service, stores assets/status/errors | Changing Bundle collection or carousel assets |
| Reel Preview / Approval Handler | Final Reel reaches Preview Ready; then user action | Sends preview via Telegram and records manual Approve/Revise decision | Automatic Instagram publication |
| Instagram Publisher - Reel route | Final Reel is manually approved and due | Uploads `Final Reel` to Instagram and records receipt | Feed/carousel logic or video rendering |

The Preview/Approval Handler may be implemented as a route in a dedicated Reel scenario rather than a separate scenario if it keeps a single clear responsibility. It must not be placed inside the existing Collector.

## Duplicate-generation decision

### Preserve Bundle creation; prevent duplicate Content creation

The Collector's Bundle creation/appending behaviour stays intact. For Reel work, Content creation must have one owner: the canonical Bundle-aware generator. It must create a Reel Content record only once per approved generation request.

The existing Collector also has direct ideation routes for ordinary text and document-photo messages. These overlap with the dedicated Content Generator. They should not be removed in this planning phase, because the user has confirmed the Collector works. In a future change, determine from live Make history whether these routes are necessary for current operation.

**Recommended safe future change:** retain the Bundle-storage routes exactly as they work; disable or gate only the direct `create Content` modules once the dedicated generator has passed controlled tests. This is not a recommendation to disable the Collector itself.

## Duplicate-prevention rules

1. **Bundle rule:** the Collector continues to append all input to one active Bundle. No Reel scenario creates Bundles or Bundle Media.
2. **Generation rule:** a Bundle-to-Reel generation run must set a unique generation/request marker before it creates a Content record. A retry reads that marker before creating again.
3. **Content rule:** each Reel Content record has one immutable Reel Production Request ID for one production attempt. TTS and assembly both receive that same ID.
4. **Asset rule:** assembly reads selected source media through the linked Bundle/scene plan and writes only `Narration`, `Subtitle File`, and `Final Reel` on the target Content record.
5. **Approval rule:** a preview is not eligible for Instagram until a human action changes it to `Approved for Publishing`.
6. **Publication rule:** the Reel publisher records Instagram ID/permalink before it writes `Published`; a retry sees that receipt and does not post again.

## Scenario sequencing

```text
Collector (enabled) -> Bundle ready
  -> canonical Bundle generator (enabled)
  -> Reel Brief Generator (new, initially manual/on-demand)
  -> Reel Production Orchestrator (new, initially manual/on-demand)
  -> Preview/Approval Handler (new)
  -> Publisher Reel route (new, initially disabled until supervised testing)
```

Keeping the new scenarios manual/on-demand during their first tests avoids accidental production/publishing and leaves the working carousel schedules unaffected.
