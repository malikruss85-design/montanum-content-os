# Make Blueprint Analysis

## Executive assessment

The repository holds six active-looking scenario exports and one empty notes file. The numeric suffixes in filenames are export-version indicators, not proof of live status. There is no way to identify the live Make scenarios, their schedules, or their current connection settings from the local exports alone.

There are no byte-identical duplicate blueprint files. The material duplicate is functional: the large Telegram Collector contains legacy/direct ideation paths that overlap `Content Generator` and should be treated as competing implementations.

## Blueprint-by-blueprint review

| Blueprint | Modules / major routes | Intended role | Finding |
| --- | --- | --- | --- |
| Telegram Collector `(8)` | Telegram trigger; document-photo, text, voice, video, finish, and text-bundle routes | Collect raw Telegram input | Contains two overlapping designs: immediate GPT-to-Content and bundle-first capture. High risk of duplicate content and inconsistent bundles. |
| Content Generator `(3)` | bundle search; photo search; router for image analysis/ideation or error | Generate five ideas from Ready bundle | Likely successor/canonical generator, but only supports photo-backed bundles. |
| Content Writer `(4)` | Approved search; GPT response; JSON parse; Content update | Write final editorial package | Incomplete validation and revision control. |
| Scheduler `(3)` | Written search; Reel/feed/carousel/story routes | Queue content for publishing | Implements a simplistic daily capacity policy but not a calendar policy. |
| Cover Generator `(26)` | Written carousel search; bundle/media lookup; HTML render; Cloudinary uploads | Build carousel cover/slides | Does not advance or lock state after successful generation. |
| Instagram Publisher `(7)` | Scheduled search; feed/carousel routes; Instagram post; update | Publish to Instagram | Does not capture external publishing identity or handle failures. |

## Duplicate / obsolete candidates

### Candidate A: direct Telegram ideation routes

The Collector's document-photo path calls vision analysis and an ideation prompt, then creates five Content records. Its ordinary-text path independently calls a similar GPT prompt and creates five more Content records. Meanwhile the same scenario has routes that capture input into Content Bundles, and the dedicated Content Generator independently turns Ready bundles into five Content records.

**Assessment:** these direct idea-generation routes are functionally duplicate/legacy relative to `Content Generator`. They must not operate concurrently with the bundle-first path. Do not delete them yet; first confirm the live scenario and compare historic Make run logs. Prefer retaining them only as versioned archive exports after validation.

### Candidate B: bundle-level media summary fields

The Collector maintains both a bundle-level `Media` attachment / `Media Count` / `Media Type` and independent `Bundle Media` rows. The dedicated generator reads Bundle Media, while several collector routes write bundle summaries.

**Assessment:** not a blueprint duplicate but duplicate representation. Bundle Media should be canonical; bundle fields should be computed rollups or removed from operational writes after migration.

### Candidate C: blueprint filename versions

Each exported filename carries a different number: `(3)`, `(4)`, `(7)`, `(8)`, `(26)`. They are different scenario families, not duplicates of one another. The suffix must not be used to decide which scenario to delete or activate.

## Detailed logic findings

### Telegram Collector

- The `finish` control word does correctly locate a collecting bundle and set it to Ready, but it has no acknowledgement to the sender and no validation that usable input exists.
- The two text routes both trigger on non-`finish` text. One directly generates five Content records; the other creates/appends a bundle. Router branches in Make are independent, so both paths run.
- The document-photo path similarly both creates Content ideas and bundle/media data. It also examines `message.document`, not the typical Telegram `message.photo` array.
- The first voice-record creation maps Telegram Chat ID from `edited_channel_post.chat.id`, which does not correspond to an ordinary received voice message. It should use the message chat source.
- Photo and video collection searches do not sort records and cap at one result, so a chat with two collecting bundles is non-deterministic.
- Existing-bundle video handling writes `Media Type`, count, and attachment as one video, instead of aggregating mixed-media content.
- Bundle Media records use inconsistent linked-record mapping form across routes and often omit Telegram Message ID. This defeats replay protection.
- The transcription request contains a hard-coded OpenAI secret and hard-codes Russian transcription language. Both must be corrected; language should be detected/configurable when business usage requires it.
- There is no authorization check, file-size control, media-group handling, or explicit Make error handler.

### Content Generator

- It selects one Ready bundle where GPT status is not Done, then fetches up to 50 photo media items.
- Route one runs only if photo data exists. It analyzes each photo, aggregates analysis, generates five ideas, creates Content rows, then marks the bundle GPT status Done.
- Route two marks GPT status Error if no photo exists. This contradicts the stated text, voice, photo, render, and video scope.
- It uses `Last Updated` descending, a retry-sensitive selection rule that can starve older Ready bundles.
- It does not claim/lock a bundle as Processing before work, so overlapping scheduled runs can process the same bundle.
- It does not preserve the structured AI response in `GPT Output`, set `Content Generated`, or verify that exactly five Content creates succeed before marking Done.

### Content Writer

- It searches one `Approved` Content record and prompts OpenAI to fill caption, hashtags, carousel slides, Reel script, and Stories.
- It requests only valid JSON but does not use a strict response schema or failure route around parsing. A normal model formatting issue can break the run.
- The carousel field is intentionally a JSON fragment rather than a JSON array. Cover Generator compensates by wrapping it in square brackets. This is brittle and has no field-level validation.
- It writes `Written` regardless of output completeness. It does not save prompt/model/version or a revision number.

### Scheduler

- It finds up to five Written records. Reels and Stories are immediately assigned today or two days ahead; Feed/Carousel checks only whether fewer than two scheduled feed/carousel records are already dated today.
- Its Feed/Carousel route then schedules every processed candidate today when capacity exists; due to per-record iteration, it can exceed the limit if search results are processed concurrently or stale.
- It has no defined time zone/time of day, no respect for an existing intentional publish date, no calendar collision lock, and no post-write verification.

### Cover Generator

- It selects Written carousel Content rows with nonblank Carousel Slides and uses the first linked bundle and photos to generate a cover plus additional slides.
- It assumes number/order of source photos should map to number/order of written slides, but no count equality or fallback asset policy is defined.
- Titles, hooks, and slide text are placed in HTML without encoding. Special characters can affect markup/render output.
- It outputs cover/image URL strings but leaves the Content status Written. The same row remains eligible on every run, causing avoidable cost and overwrite risk.

### Instagram Publisher

- Feed route posts the latest photo in the source bundle; it does not use the generated cover or an explicitly approved final asset.
- Carousel route splits newline-separated `Instagram Carousel URLs`, but no upstream blueprint populates that field in the exports; Cover Generator writes a differently named `Carousel Image URLs` field.
- Both routes update Content to Posted but fail to save Instagram media ID, permalink, published timestamp, caption snapshot, or provider response.
- There is no explicit publish-date/time eligibility check in the search formula; the scenario assumes its schedule governs timing.
- Reel and Story status records are ignored, despite being accepted earlier in the pipeline.

## Make hardening standards for the implementation phase

- Give each scenario one responsibility and one input/output state transition.
- Claim records atomically (`Processing` plus run ID) before external calls.
- Put every API call behind a named error handler that records an Error/Job row and a retry policy.
- Use Make connections/secret storage only; no literal keys, tokens, or passwords in mapper fields.
- Make every creation idempotent with an external update/message ID or deterministic idempotency key.
- Validate AI JSON against an explicit schema before Airtable writes.
- Store provider response ID and model/prompt version, not secrets or unnecessary raw personal data.
