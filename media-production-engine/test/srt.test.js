import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSceneSrt, formatSrtTimestamp } from '../src/services/srt.js';
import { createCloudinaryReelAssemblyPlan } from '../src/services/cloudinary-reel-url.js';

test('formats SRT timestamps across minute boundaries', () => assert.equal(formatSrtTimestamp(61.005), '00:01:01,005'));

test('creates one approved timed caption per ordered scene', () => {
  const srt = buildSceneSrt([
    { sequence: 1, sourceAssetType: 'original_photo', stillDuration: 2.5, subtitleSegment: 'First line.' },
    { sequence: 2, sourceAssetType: 'original_video', trimStart: 1, trimEnd: 4, subtitleSegment: 'Second line.' }
  ]);
  assert.equal(srt, '1\n00:00:00,000 --> 00:00:02,500\nFirst line.\n\n2\n00:00:02,500 --> 00:00:05,500\nSecond line.\n');
});

test('adds scene-timed SRT to a Cloudinary assembly plan when requested', () => {
  const plan = createCloudinaryReelAssemblyPlan({
    narrationPublicId: 'narration', subtitlesPublicId: 'subtitles.srt', includeSrt: true,
    scenes: [{ sequence: 1, sourceAssetType: 'original_photo', sourcePath: 'https://res.cloudinary.com/dsmg07va6/image/upload/v1/source.jpg', stillDuration: 2, subtitleSegment: 'Approved English caption.' }]
  });
  assert.match(plan.srt, /00:00:00,000 --> 00:00:02,000/);
});
