import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { reelFixture } from '../src/fixtures/reel-fixture.js';

test('reports queued, narration-ready, and final-render-ready events to Make', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-callbacks-'));
  const originalFetch = global.fetch;
  const events = [];
  global.fetch = async (_url, options) => { events.push({ headers: options.headers, body: JSON.parse(options.body) }); return new Response('', { status: 200 }); };
  try {
    const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out'), MPE_PUBLIC_BASE_URL: 'https://engine.example.test', MPE_CALLBACK_URL: 'https://make.example.test/hook', MPE_CALLBACK_TOKEN: 'callback-token', MPE_CALLBACK_SIGNING_SECRET: 'callback-secret' });
    app.productionService.tts = { synthesize: async () => ({ assetId: 'asset_narration', assetClass: 'narration', storageReference: 'narration.mp3' }) };
    app.productionService.renderer = { render: async () => ({ subtitleAsset: { assetId: 'asset_subtitle', assetClass: 'subtitle', storageReference: 'subtitles.srt' }, finalAsset: { assetId: 'asset_final', assetClass: 'final_publication', storageReference: 'final.mp4' } }), validate: async () => ({ width: 1080, height: 1920, durationSeconds: 2, hasAudio: true }) };
    const result = await app.productionService.start(reelFixture({ video: 'video.mp4', image: 'image.png' }));
    assert.equal(result.run.status, 'succeeded');
    assert.deepEqual(events.map(event => event.body.eventType), ['run_queued', 'narration_ready', 'final_render_ready']);
    assert.equal(events.at(-1).body.outputAssets.find(asset => asset.assetClass === 'final_publication').assetId, 'asset_final');
    assert.equal(events.at(-1).body.outputAssets.find(asset => asset.assetClass === 'final_publication').downloadUrl, 'https://engine.example.test/v1/assets/asset_final');
    assert.equal(events[0].headers.authorization, 'Bearer callback-token');
  } finally {
    global.fetch = originalFetch;
    await fs.rm(temp, { recursive: true, force: true });
  }
});
