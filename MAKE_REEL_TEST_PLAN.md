# Make Reel Test Plan

## Precondition

Complete only after Airtable additive schema exists, engine is deployed behind secured HTTPS, and the Reel Publisher route remains disabled.

1. **Brief idempotency:** run Reel Brief Generator twice against one Reel Content record. Expected: one scene set only.
2. **Mixed-media manifest:** use one existing test Bundle containing video, image/render, text, and transcript. Expected: all context enters the brief and every Scene references parent Bundle media.
3. **Production duplicate:** run Starter twice with unchanged scene version. Expected: same Engine run ID; no duplicate run.
4. **Callback duplicate:** replay one signed final-render callback. Expected: one Airtable state/asset update and no second Telegram preview.
5. **Missing source:** submit an approved Scene with unavailable asset. Expected: Production Failed, clear error, no preview.
6. **Approval invalidation:** approve a preview, change one Scene Version, then render again. Expected: old approval clears and no publishing eligibility.
7. **Revision action:** select Request Revision in Telegram. Expected: existing assets retained; status returns to Brief Ready.
8. **Publisher guard:** with route disabled, confirm no post occurs. Then in supervised test environment enable route with an approved final Reel. Expected: exactly one post and receipt saved.
9. **Feed/carousel non-regression:** run current existing scenarios on a known carousel/feed record. Expected: no Reel fields/routes interfere.

Record Content ID, Bundle ID, Scene IDs, Run ID, Engine event IDs, Telegram update IDs, and Instagram receipt for every test.
