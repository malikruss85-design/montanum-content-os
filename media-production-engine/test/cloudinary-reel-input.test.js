import test from 'node:test';
import assert from 'node:assert/strict';
import { createCloudinaryReelPlanFromBrief } from '../src/services/cloudinary-reel-input.js';

const input = {
  narrationPublicId: 'reels/recContent/v3/narration',
  subtitlesPublicId: 'reels/recContent/v3/subtitles.en.srt',
  scenePlan: JSON.stringify([
    { scene_id: 'brief_1', sequence: 1, source_bundle_media_id: 'recImage', source_asset_type: 'render', duration_seconds: 3, subtitle_segment: 'A quiet arrival.' },
    { scene_id: 'brief_2', sequence: 2, source_bundle_media_id: 'recVideo', source_asset_type: 'original_video', duration_seconds: 4, trim_start_seconds: 2, subtitle_segment: 'A considered stay.' }
  ]),
  bundleMedia: [
    { id: 'recImage', fields: { 'File URL': 'https://res.cloudinary.com/dsmg07va6/image/upload/v11/bundles/courtyard.jpg' } },
    { id: 'recVideo', fields: { 'File URL': 'https://res.cloudinary.com/dsmg07va6/video/upload/v12/bundles/arrival.mp4' } }
  ]
};

test('joins Reel Brief scene IDs to durable Cloudinary Bundle Media URLs', () => {
  const plan = createCloudinaryReelPlanFromBrief({ ...input, includeSrt: true });
  assert.equal(plan.expectedDurationSeconds, 7);
  assert.match(plan.finalReelUrl, /l_video:bundles:arrival.*so_2,eo_6/);
  assert.match(plan.finalReelUrl, /l_subtitles:reels:recContent:v3:subtitles.en.srt/);
  assert.match(plan.srt, /00:00:03,000 --> 00:00:07,000/);
});

test('refuses a brief scene that points to media outside the selected Content Bundle', () => {
  const scenePlan = [{ sequence: 1, source_bundle_media_id: 'recMissing', source_asset_type: 'render', duration_seconds: 3, subtitle_segment: 'No source.' }];
  assert.throws(() => createCloudinaryReelPlanFromBrief({ ...input, scenePlan }), /references missing Bundle Media recMissing/);
});

test('uses the approved scene duration from zero only when a video trim start was not specified', () => {
  const scenePlan = [{ sequence: 1, source_bundle_media_id: 'recVideo', source_asset_type: 'original_video', duration_seconds: 5, subtitle_segment: 'Clip.' }];
  const plan = createCloudinaryReelPlanFromBrief({ ...input, scenePlan });
  assert.match(plan.finalReelUrl, /so_0,eo_5/);
});
