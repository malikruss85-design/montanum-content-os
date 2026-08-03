import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { SourceMediaService } from '../src/services/source-media.js';

test('downloads an allowed Cloudinary source into the run input directory', async () => {
  const inputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-source-'));
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'content-type': 'image/jpeg', 'content-length': '3' } });
  try {
    const service = new SourceMediaService({ inputDir, allowedSourceHosts: ['res.cloudinary.com'], sourceDownloadMaxBytes: 10, sourceDownloadTimeoutMs: 1000 });
    const [scene] = await service.prepareScenes('run_123', [{ sequence: 1, sourceAssetId: 'asset_1', sourcePath: 'https://res.cloudinary.com/demo/image/upload/photo.jpg' }]);
    assert.match(scene.sourcePath, /run_123/); assert.equal(scene.sourceUrl, 'https://res.cloudinary.com/demo/image/upload/photo.jpg'); assert.deepEqual([...await fs.readFile(scene.sourcePath)], [1, 2, 3]);
  } finally { global.fetch = originalFetch; await fs.rm(inputDir, { recursive: true, force: true }); }
});

test('rejects unapproved source hosts before download', async () => {
  const service = new SourceMediaService({ inputDir: 'input', allowedSourceHosts: ['res.cloudinary.com'], sourceDownloadMaxBytes: 10, sourceDownloadTimeoutMs: 1000 });
  await assert.rejects(service.prepareScenes('run_123', [{ sequence: 1, sourceAssetId: 'asset_1', sourcePath: 'https://example.test/video.mp4' }]), /not allowed/);
});

test('rejects a still image mapped as an original video', async () => {
  const originalFetch = global.fetch; global.fetch = async () => new Response(new Uint8Array([1]), { status: 200, headers: { 'content-type': 'image/jpeg' } });
  try {
    const service = new SourceMediaService({ inputDir: 'input', allowedSourceHosts: ['res.cloudinary.com'], sourceDownloadMaxBytes: 10, sourceDownloadTimeoutMs: 1000 });
    await assert.rejects(service.prepareScenes('run_123', [{ sequence: 1, sourceAssetId: 'asset_1', sourceAssetType: 'original_video', sourcePath: 'https://res.cloudinary.com/demo/image/upload/photo.jpg' }]), /requires a video/);
  } finally { global.fetch = originalFetch; }
});
