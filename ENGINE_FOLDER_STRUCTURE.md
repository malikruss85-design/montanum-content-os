# Engine Folder Structure

```text
media-production-engine/
  package.json                 local commands; no existing project package is changed
  README.md                    engine-specific overview
  src/
    server.js                  authenticated local HTTP API and health check
    app.js                     composition root
    config.js                  local configuration
    contracts.js               command, scene, profile, callback validation
    ids.js                     stable IDs and input signatures
    logger.js                  JSON-line logger
    repositories.js            local production-run / asset persistence
    services/
      production-service.js    idempotent command orchestration
      approval-service.js      approval invalidation
      renderer.js              FFmpeg local Reel renderer
      mock-tts.js              development-only narration adapter
    fixtures/
      reel-fixture.js          deterministic test fixture
  test/
    contracts.test.js
    idempotency.test.js
    renderer.test.js
    approval.test.js
  data/                        ignored local run state (created at runtime)
  logs/                        ignored local structured logs (created at runtime)
  output/                      ignored local renders (created at runtime)
```

All new files are isolated in this folder. The existing project folders and audit/architecture records remain untouched.
