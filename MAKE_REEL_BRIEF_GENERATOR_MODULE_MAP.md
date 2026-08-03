# Montanum - Reel Brief Generator: Module Map

Build one new scenario in this exact order. Set `maxRecords = 1` for every search that selects a work item.

| # | Make module | Purpose | Input -> output | Filter before module | Airtable fields mapped | Error route / retry |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Airtable > Search Records (`Content Bundles`) | Select oldest ready Bundle | `Status = Ready`, no completed Project Showcase key -> Bundle record | Scenario trigger only | Reads `Bundle ID`, `User Message`, `Voice Transcript`, `Project`, `Bundle Media`, `Status` | Search failure -> module 25. Retry next schedule; no writes. |
| 2 | Airtable > Search Records (`Content`) | Locate existing brief by exact key | Bundle record ID + version -> Content record | Bundle exists | Reads `Reel Brief Idempotency Key`, `Reel Brief Version`, `Content Bundles`, `Post Type` | Lookup failure -> 25. |
| 3 | Tools > Set variable | Compute first/current version and idempotency key | Bundle ID + version -> `brief:{recordId}:project_showcase:{version}` | Bundle exists | None | Validation failure -> 25. |
| 4 | Airtable > Create Record (`Content`) | Create minimal target only when absent | Key and Bundle -> Content record | Only if module 2 found no record | `Content Bundles`, `Post Type=Reel`, `Content Section=Projects`, `Reel Type=Project Showcase`, `Reel Brief Version`, `Reel Brief Idempotency Key`, `Reel Production Status=Not Requested`, `Reel Approval Status=Not Requested` | Write failure -> 25. Do not retry create without re-running lookup. |
| 5 | Tools > Set variable | Select target Content ID | Existing or newly created ID -> target ID | Always after 2/4 | None | N/A |
| 6 | Airtable > Get Record (`Content Bundles`) | Read complete source Bundle | Bundle record ID -> complete Bundle | Bundle exists | `User Message`, `Voice Transcript`, `Project`, `Bundle Media`, `Bundle ID` | Get failure -> 25. |
| 7 | Airtable > Search Records (`Bundle Media`) | Load all source media | linked Bundle / canonical bundle relation -> ordered media manifest | Bundle exists | `File URL`, `Attachment`, `File Name`, `Media Type`, `Order`, `Telegram Message ID`, `Bundle` | Failure -> 25. |
| 8 | Airtable > Get Record (`Projects`) | Read Project only if linked | Bundle Project link -> Project record | Filter: Project link exists | Project context fields allowed by base | Failure -> 25; if no link, route skips. |
| 9 | Tools > Text/Array aggregator | Produce explicit media manifest | Bundle + all media + optional project -> JSON context | At least one text/transcript/media item | None | Manifest error -> 25. |
| 10 | Filter | Prevent empty input GPT call | media count > 0 OR user text exists OR transcript exists | As stated | None | Failing branch -> 24. |
| 11 | OpenAI > Create Model Response | Generate Project Showcase brief | Prompt + manifest -> strict JSON response | Valid manifest | No Airtable write | API/error -> 25, bounded Make retry once only. |
| 12 | JSON > Parse JSON | Parse response | Model text -> JSON | Response exists | No Airtable write | Parse error -> 25; never continue. |
| 13 | Tools > Iterator | Inspect every scene | `scenes[]` -> individual scene | JSON valid | No Airtable write | Invalid item -> 25. |
| 14 | Airtable > Search Records (`Bundle Media`) | Verify scene source belongs to Bundle | `source_bundle_media_id` -> matching Bundle Media row | Source ID nonempty | Reads Airtable record ID / bundle relation | Missing/nonmatching source -> 25. |
| 15 | Filter | Validate scene source | Found media belongs to module 6 Bundle | Source lookup exists | None | Failing branch -> 25. |
| 16 | Tools > Array aggregator | Aggregate validated scene payloads | Validated scene rows -> ordered scene list | All scenes pass | None | Aggregation failure -> 25. |
| 17 | Tools > Set variable | Validate total duration/readiness | Scene sum vs target; missing-media policy -> status fields | Total <= target duration and all sources valid | `Rendering Readiness` candidate | Invalid -> 25. |
| 18 | Tools > Iterator | Prepare typed Media Scene writes | Validated scenes -> row mapping | Valid scene list | None | Mapping failure -> 25. |
| 19 | Airtable > Search Records (`Media Scenes`) | Find scene by immutable Scene ID | Scene ID + target Content -> existing scene | Always | Reads `Scene ID`, `Content`, `Scene Version` | Lookup failure -> 25. |
| 20 | Airtable > Update Record (`Media Scenes`) | Update matching typed Scene | Existing scene + mapped values -> updated scene | Existing Scene ID | All exact Media Scenes fields from schema | Write failure -> 25. |
| 21 | Airtable > Create Record (`Media Scenes`) | Create missing typed Scene | Validated mapping -> new scene | No matching Scene ID | All exact Media Scenes fields from schema | Write failure -> 25. |
| 22 | Airtable > Update Record (`Content`) | Commit validated brief | Target Content + all outputs -> ready brief | All scene writes succeeded | Fields in implementation mapping; `Reel Production Status=Scenes In Review`, error blank, generated time/model | Write failure -> 25. No retry without lookup. |
| 23 | Tools > Set variable / logger note | Mark success for Make run history | IDs/status -> completion message | Update succeeded | None | N/A |
| 24 | Airtable > Update Record (`Content`) | Handle insufficient input | Target Content -> failure state | Module 10 fails | `Reel Production Status=Production Failed`, `Reel Production Error=Bundle has no usable media, text, or voice transcript.` | Retry only after Bundle correction. |
| 25 | Airtable > Update Record (`Content`) | Handle every terminal error | Target Content + safe error -> failure state | Any error route after target exists | `Reel Production Status=Production Failed`, `Reel Production Error` | Retry only from explicit operator action after root cause is corrected. |

Do not put module 25 on a branch where no target Content record exists; log the Make error and leave the Bundle unchanged instead.
