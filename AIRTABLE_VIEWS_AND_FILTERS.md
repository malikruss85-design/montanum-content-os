# Airtable Views and Filters

Create these as new views only; do not alter existing views.

| Table / view | Filter | Sort | Purpose |
| --- | --- | --- | --- |
| Content / `Reel Brief Ready` | `Post Type = Reel` AND `Reel Production Status = Brief Ready` | Last modified ascending | Editorial/scene planning queue. |
| Content / `Reel Scenes In Review` | `Post Type = Reel` AND `Reel Production Status = Scenes In Review` | Publish Date ascending | Manual scene review. |
| Content / `Reel Production Queue` | `Post Type = Reel` AND `Reel Production Status = Scenes Approved` | Priority desc, Created Time asc | Future Make starter queue. |
| Content / `Reel Approval Required` | `Post Type = Reel` AND `Reel Production Status = Approval Required` | Reel Preview Sent At asc | Preview approval worklist. |
| Content / `Reel Production Failed` | `Post Type = Reel` AND `Reel Production Status = Production Failed` | Last modified descending | Retry/operator attention. |
| Content / `Reels Approved for Publishing` | `Post Type = Reel` AND `Reel Production Status = Approved for Publishing` AND `Final Reel Asset is not empty` | Publish Date ascending | Disabled initial publishing route input. |
| Media Scenes / `Scenes Awaiting Approval` | `Scene Approval Status = Draft` OR `Changes Requested` | Content, Sequence ascending | Editable scene review. |
| Media Scenes / `Scene Render Failures` | `Scene Production Status = Failed` | Last modified descending | Technical recovery. |
| Production Runs / `Active Runs` | `Status = Queued` OR `Running` OR `Retry Scheduled` | Started At ascending | Engine operations. |
| Production Runs / `Failed Runs` | `Status = Failed` | Completed At descending | Error review. |

Do not set an automation on `Reel Production Queue` until the local engine and Make test plan are approved.
