import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createApp } from '../src/app.js';

test('invalidates prior approval after a scene version change', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-approval-')); const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out') });
  await app.repository.save({ runId: 'run_approval_fixture', status: 'succeeded', approval: { status: 'approved' } });
  const run = await app.productionService.invalidateApproval('run_approval_fixture', 2);
  assert.equal(run.approval.status, 'invalidated'); assert.equal(run.approval.sceneVersion, 2);
});
