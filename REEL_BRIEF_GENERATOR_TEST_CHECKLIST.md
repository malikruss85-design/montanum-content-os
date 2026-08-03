# Reel Brief Generator Test Checklist

Run every case with the Reel Publisher disabled and without altering the Telegram Collector or carousel scenarios.

| # | Case | Setup | Expected result |
| ---: | --- | --- | --- |
| 1 | Photos only | Ready Bundle with linked photos/renders and text context | One Project Showcase Content brief; scenes use only linked photo/render IDs. |
| 2 | Videos only | Ready Bundle with linked videos | One brief; scenes use only linked video IDs. |
| 3 | Voice plus photos | Ready Bundle with transcript and photos | Transcript is context; scenes reference photos only. |
| 4 | Text, photos, videos | Mixed media Ready Bundle | Full manifest used; scene IDs are unique and all sources valid. |
| 5 | Linked Project | Bundle has valid Project link | Project context is used; existing Project link is retained on Content. |
| 6 | No Project | Bundle Project link blank | Brief succeeds from Bundle only; no Project record is created. |
| 7 | Insufficient media | Bundle lacks media and meaningful text/transcript | Content status Production Failed with human-readable missing-input error; no GPT call/scenes. |
| 8 | Invalid GPT JSON | Controlled malformed response | Content status Production Failed; no success status or partial Scene writes. |
| 9 | Repeated execution | Run unchanged Bundle/version twice | Same `Reel Brief Idempotency Key`; no duplicate Content or Scene set. |
| 10 | Existing brief update | Run against existing matching key | Existing Content/Scenes update through upsert; no duplicate record. |
| 11 | Approval invalidation | Mark a test brief approved, then explicitly create a new version | New version updates brief; approval becomes Invalidated; no assets/runs deleted. |
| 12 | Airtable write failure | Force a test-table/permission write failure | Status/error recorded where possible; no duplicate retry create. |

For every run record: Bundle Airtable record ID, Content record ID, idempotency key, prompt/model version, Scene IDs, Make run URL, status, and error text if applicable.
