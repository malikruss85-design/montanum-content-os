# Airtable Analysis

## Current data model

The exported base contains the correct initial entities for a content system: Projects, Content Bundles, Bundle Media, and Content. Its issue is not lack of tables alone; it is that its operational relationships and lifecycle fields are not enforced consistently.

| Table | Purpose in current base | Exported record count | Main findings |
| --- | --- | ---: | --- |
| Projects | Project context and project media | 4 | Content is linked for 3 projects, but no bundle links or main content angles are populated. |
| Content Bundles | One intake session / raw input package | 34 | High failure count; GPT tracking fields conflict with status; source-to-output link is empty. |
| Bundle Media | Individual source media | 63 | Media storage exists but ordering and completeness are weak; four records are unlinked. |
| Content | Ideation through publication fields | 24 | Basic ideas exist, but final production/scheduling fields are empty and state values do not match scenario gates. |

## Existing relationships

| Relationship | Evidence | Audit result |
| --- | --- | --- |
| Bundle -> Bundle Media | `Bundle`, `Bundle ID Text`, and attachment/file fields in Bundle Media | Present, but 4 of 63 media rows have no bundle. Use a linked record as canonical; do not join on a copied text ID. |
| Bundle -> Content | `Linked Content` / `Content Bundles` fields | Intended but not evidenced in exports: bundle linked content is blank; Content has 10 populated source-bundle values. |
| Project -> Content | Content `Project`; Projects `Content` | Present for 14 Content records / 3 Projects, but not consistently set by automations. |
| Project -> Bundle | Project field exists on Bundles and bundle link exists on Projects | No exported values; collector/generator does not identify or resolve project reliably. |

## Field and relationship gaps

### Projects

Add or confirm:

- Immutable Project Code and a canonical linked-record name.
- Active flag, content-use permission/right-to-publish, project owner, language/market, and approved brand/project context.
- Structured project prompt context or a reference to a controlled knowledge asset, rather than relying on model guesses.
- Project media rights, confidentiality classification, expiry/retention policy, and preferred/approved assets.

### Content Bundles

Add or confirm:

- `Bundle Code` as immutable human reference; use Airtable record ID only internally for joins.
- Canonical `Bundle Status` with a single select: `Collecting`, `Ready`, `Processing`, `Generated`, `Needs Input`, `Failed`, `Cancelled`, `Completed`.
- `Active Bundle Key` or an explicit separate `Conversation/Collection Session` entity to guarantee one open bundle per chat/user.
- `Source Update IDs` or a separate Intake Events table with a uniqueness mechanism for Telegram update/message idempotency.
- `Input Validation Result`, `Input Summary`, `Detected Language`, `Error Code`, `Error Detail`, `Failure Stage`, `Retry Count`, `Last Attempt`, and `Run ID`.
- `Generation Job` relationship and a valid `Generated Content` linked field. Retire overlapping `GPT Status`, `GPT Output`, and `Content Generated` fields after migration.
- Project relationship populated by an explicit selection/detection workflow, never ambiguous model text alone.

### Bundle Media

Add or confirm:

- Immutable external-source key (`Telegram Message ID` plus chat/file identifier), source update ID, and provider asset/public ID.
- Integer `Sequence` required within a bundle. The current `Order` is populated in only 2 of 63 records, and `Slider order` is unused by scenarios.
- Original MIME type, byte size, width, height, duration, checksum, upload timestamp, and processing status.
- `Asset Role` (source, approved hero, carousel background, cover, generated slide), moderation/rights status, and explicit deletion/retention marker.
- Valid link to Bundle required for every operational media row; investigate/quarantine existing unlinked rows.

### Content

Add or confirm:

- Separate `Content Status` and `Editorial Approval Status` only if each has a clear owner; otherwise one status state machine is preferable.
- `Source Bundle` relationship required for generated content, `Project` relationship where known, and `Parent Content` / version for revisions.
- Native structured JSON or linked `Slides` records rather than a JSON fragment in a text field.
- An explicit `Approved Asset Set` relationship. Do not publish from whatever happens to be latest bundle media.
- `Scheduled At` (timezone-aware), `Published At`, `Instagram Media ID`, permalink, provider response reference, publish attempt, and publish error.
- Prompt template version, model, generation job relationship, review owner, approved-by, and timestamps.

## Recommended future tables

The knowledge base correctly identifies later-stage tables. Introduce only after Phase 1 relationship/state repairs are verified.

| Table | Why it is needed |
| --- | --- |
| Intake Events | Deduplicates Telegram updates and preserves the input audit trail. |
| Jobs / Errors | Captures each AI/render/publish operation, retry, provider ID, cost, and error. |
| Assets | Normalizes source and generated media, approvals, renditions, and provider IDs. |
| Slides / Scenes | Gives carousel slides and Reel scenes a typed sequence instead of fragile JSON text. |
| Publications | Separates channel publication facts from editorial Content records and supports reposts. |
| Prompt Templates | Version-controls prompts independently from Make modules. |

## Status-model recommendation

Use the following minimum controlled transitions:

```text
Bundle: Collecting -> Ready -> Processing -> Generated -> Completed
                       |              |
                       v              v
                  Needs Input       Failed (retryable)

Content: Idea -> Draft -> In Review -> Approved -> Written -> Ready to Publish
                                                         -> Scheduled -> Published
                           \-> Revision Requested -> Draft
```

Every scenario must read and write only one defined transition. `GPT Status` should become the status of a linked generation Job, not a competing bundle lifecycle.

## Data-quality actions after approval

1. Export Airtable base schema including field types, formulas, linked-field inverses, select options, views, automations, interfaces, and permissions.
2. Identify why 19 bundles are `Failed` while 27 GPT statuses are `Done` and their output/link fields are blank.
3. Reconcile the four unlinked Bundle Media records and the seven media records missing file data. Do not delete any record until it is classified.
4. Resolve whether the ten Content records with source bundles were created by the dedicated generator or the legacy collector path.
5. Decide whether the one `Posted` record has a real Instagram post; record its external identifier before using it as a workflow exemplar.
