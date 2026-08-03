# Montanum - Reel Brief Generator: Error Handling

## Rules

- Never continue after invalid JSON, unrecognized source media, or a failed Airtable write.
- Never create a second Content record after a failed/retried execution; rerun duplicate lookup first.
- Never change existing Bundle status or Collector behaviour.
- Error text must identify the failed stage without containing secrets, raw headers, or full provider payloads.

| Failure | Detection | Airtable action | Retry rule |
| --- | --- | --- | --- |
| Bundle not found | Module 1 returns none | No Content write; Make run ends `No ready Bundle` | Next schedule/manual run. |
| No usable input | Module 10 fails | Target Content -> `Production Failed`; error explains no media/text/transcript | After Bundle is corrected and a new brief version is explicitly requested. |
| Project lookup failed | Module 8 error | Target Content -> `Production Failed`; retain Bundle source | Fix link/access then explicit retry. |
| GPT API failure | Module 11 error/timeout | Target Content -> failure with `GPT request failed; retryable` | One bounded automatic retry; then manual retry. |
| Invalid GPT JSON | Module 12 error | Target Content -> failure with `GPT returned invalid structured JSON` | Manual retry after prompt/model review. |
| Invalid scene source | Modules 14/15 fail | Target Content -> failure including scene number; no scene commit | Correct source/brief, new version. |
| Duration/readiness invalid | Module 17 fails | Target Content -> failure including duration condition | Regenerate revised brief. |
| Scene write failed | Module 20/21 error | Target Content -> failure; retain any known existing scenes | Lookup/upsert on retry; never blindly create. |
| Content write failed | Module 22 error | Make error only if no target; otherwise target -> failure if possible | Verify Airtable permission/field ID, retry same key. |
| Duplicate execution | Module 2 finds same key | Update/return existing target only; no new Content | Safe no-op/update. |

## Material brief change

If the model output changes after an explicit regeneration, increment `Reel Brief Version`, create a new key, write `Reel Approval Status = Invalidated`, and set `Reel Production Status = Scenes In Review` only after new scenes are complete. Do not delete previous scene/assets/run records; mark supersession in later production work.
