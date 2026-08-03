import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createServer } from '../src/server.js';

test('serves completed final assets only with the engine bearer token', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-assets-'));
  const app = createApp({ ...process.env, MPE_API_TOKEN: 'engine-token', MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'output') });
  const finalPath = path.join(temp, 'output', 'reel.mp4'); await fs.mkdir(path.dirname(finalPath), { recursive: true }); await fs.writeFile(finalPath, 'mp4-bytes');
  await app.repository.save({ runId: 'run_asset_test', assets: [{ assetId: 'asset_1234567890abcdef12345678', assetClass: 'final_publication', storageReference: finalPath }] });
  const engine = createServer(app); await new Promise(resolve => engine.server.listen(0, '127.0.0.1', resolve));
  const { port } = engine.server.address(); const url = `http://127.0.0.1:${port}/v1/assets/asset_1234567890abcdef12345678`;
  try {
    const denied = await fetch(url); assert.equal(denied.status, 401);
    const response = await fetch(url, { headers: { authorization: 'Bearer engine-token' } }); assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'video/mp4'); assert.equal(await response.text(), 'mp4-bytes');
  } finally { engine.server.closeAllConnections?.(); await new Promise(resolve => engine.server.close(resolve)); await fs.rm(temp, { recursive: true, force: true }); }
});
