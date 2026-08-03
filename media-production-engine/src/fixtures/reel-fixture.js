import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { instagramReelProfile } from '../contracts.js';

function execute(binary, args) { return new Promise((resolve, reject) => { const child = spawn(binary, args, { windowsHide: true }); let stderr = ''; child.stderr.on('data', c => { stderr += c; }); child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(`Fixture FFmpeg failed (${code}): ${stderr}`))); }); }

export async function createFixtureAssets({ ffmpegPath, directory }) {
  await fs.mkdir(directory, { recursive: true });
  const video = path.join(directory, 'source-video.mp4'); const image = path.join(directory, 'source-image.png');
  await execute(ffmpegPath, ['-y', '-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=30', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', video]);
  await execute(ffmpegPath, ['-y', '-f', 'lavfi', '-i', 'color=c=0x1e293b:s=1280x720', '-frames:v', '1', image]);
  return { video, image };
}

export function reelFixture({ video, image }) {
  return {
    command: 'start_production', idempotencyKey: 'fixture-content-001:v1', contentId: 'recContentFixture001', bundleId: 'recBundleFixture001', renderingProfile: instagramReelProfile,
    voiceOverScript: 'A short local narration test.', subtitleText: 'A short local narration test.',
    scenes: [
      { sceneId: 'scene_fixture_1', sequence: 1, sourceAssetId: 'asset_fixture_video', sourceAssetType: 'original_video', sourcePath: video, trimStart: 0, trimEnd: 1.4, outputAspectRatio: '9:16', fitMode: 'cover', transition: 'cut', approvalStatus: 'Approved', productionStatus: 'Not queued' },
      { sceneId: 'scene_fixture_2', sequence: 2, sourceAssetId: 'asset_fixture_image', sourceAssetType: 'original_photo', sourcePath: image, stillDuration: 1.2, outputAspectRatio: '9:16', fitMode: 'cover', transition: 'cut', approvalStatus: 'Approved', productionStatus: 'Not queued' }
    ]
  };
}
