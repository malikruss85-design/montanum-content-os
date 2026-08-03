import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createFixtureAssets, reelFixture } from '../src/fixtures/reel-fixture.js';

const canRun = async (binary) => { try { const { spawn } = await import('node:child_process'); await new Promise((resolve, reject) => { const child = spawn(binary, ['-version'], { windowsHide: true }); child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error('missing'))); }); return true; } catch { return false; } };

test('builds a Reel from approved Cloudinary source URLs', { timeout: 120000 }, async (t) => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-remote-production-'));
  const app = createApp({ ...process.env, MPE_DATA_DIR: path.join(temp, 'data'), MPE_INPUT_DIR: path.join(temp, 'input'), MPE_LOG_DIR: path.join(temp, 'logs'), MPE_OUTPUT_DIR: path.join(temp, 'out') });
  if (!(await canRun(app.config.ffmpegPath))) { await fs.rm(temp, { recursive: true, force: true }); return t.skip('FFmpeg unavailable'); }
  const fixtures = await createFixtureAssets({ ffmpegPath: app.config.ffmpegPath, directory: path.join(temp, 'fixture') });
  const bytes = new Map([
    ['https://res.cloudinary.com/montanum/video/upload/source.mp4', await fs.readFile(fixtures.video)],
    ['https://res.cloudinary.com/montanum/image/upload/source.png', await fs.readFile(fixtures.image)]
  ]);
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const value = bytes.get(String(url)); if (!value) return new Response('', { status: 404 });
    const type = String(url).endsWith('.mp4') ? 'video/mp4' : 'image/png'; return new Response(value, { status: 200, headers: { 'content-type': type, 'content-length': String(value.length) } });
  };
  try {
    const command = reelFixture({ video: 'https://res.cloudinary.com/montanum/video/upload/source.mp4', image: 'https://res.cloudinary.com/montanum/image/upload/source.png' });
    const result = await app.productionService.start(command);
    assert.equal(result.run.status, 'succeeded'); assert.equal(result.run.validation.width, 1080); assert.equal(result.run.scenes.every(scene => !scene.sourcePath.startsWith('https://')), true);
  } finally { global.fetch = originalFetch; await fs.rm(temp, { recursive: true, force: true }); }
});
