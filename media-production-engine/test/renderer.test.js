import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createApp } from '../src/app.js';
import { createFixtureAssets, reelFixture } from '../src/fixtures/reel-fixture.js';

const hasFfmpeg = async (binary) => { try { const { spawn } = await import('node:child_process'); await new Promise((resolve, reject) => { const p = spawn(binary, ['-version'], { windowsHide: true }); p.on('error', reject); p.on('close', c => c === 0 ? resolve() : reject(new Error('missing'))); }); return true; } catch { return false; } };

test('assembles and validates a 1080x1920 local Reel fixture', { timeout: 120000 }, async (t) => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-render-')); const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out') });
  if (!(await hasFfmpeg(app.config.ffmpegPath))) return t.skip('FFmpeg unavailable: set MPE_FFMPEG_PATH to a project-local binary to run renderer integration');
  const assets = await createFixtureAssets({ ffmpegPath: app.config.ffmpegPath, directory: path.join(temp, 'fixture') }); const result = await app.productionService.start(reelFixture(assets));
  assert.equal(result.run.status, 'succeeded'); assert.equal(result.run.validation.width, 1080); assert.equal(result.run.validation.height, 1920); await fs.access(result.run.assets.find(asset => asset.assetClass === 'final_publication').storageReference);
});
test('fails clearly when a source asset does not exist', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-missing-')); const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out') });
  const command = reelFixture({ video: path.join(temp, 'missing.mp4'), image: path.join(temp, 'missing.png') });
  await assert.rejects(() => app.productionService.start(command), /ENOENT|no such file/i);
});
