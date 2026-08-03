import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createApp } from '../src/app.js';
import { reelFixture } from '../src/fixtures/reel-fixture.js';
import { inputSignature, stableRunId } from '../src/ids.js';

test('returns existing run for an unchanged duplicate command before rendering', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-idempotency-'));
  const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out') });
  const command = reelFixture({ video: 'not-needed.mp4', image: 'not-needed.png' }); const runId = stableRunId(command.idempotencyKey);
  await app.repository.save({ runId, inputSignature: inputSignature(command), status: 'succeeded' });
  const response = await app.productionService.start(command);
  assert.equal(response.duplicate, true); assert.equal(response.run.runId, runId);
});
test('rejects reuse of an idempotency key with changed input', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-idempotency-'));
  const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out') });
  const command = reelFixture({ video: 'a.mp4', image: 'b.png' });
  await app.repository.save({ runId: stableRunId(command.idempotencyKey), inputSignature: inputSignature(command), status: 'succeeded' });
  await assert.rejects(() => app.productionService.start({ ...command, subtitleText: 'changed' }), /different input/);
});
