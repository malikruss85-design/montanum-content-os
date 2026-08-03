import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCloudinaryReelUrl, createCloudinaryReelAssemblyPlan, parseCloudinaryDeliveryUrl } from '../src/services/cloudinary-reel-url.js';

const baseInput = {
  cloudName: 'dsmg07va6',
  narrationPublicId: 'reels/rec123/v1/narration',
  subtitlesPublicId: 'reels/rec123/v1/subtitles.en',
  scenes: [
    { sequence: 1, resourceType: 'image', publicId: 'telegram/file_98', durationSeconds: 6 },
    { sequence: 2, resourceType: 'video', publicId: 'telegram/file_99', durationSeconds: 4, startSeconds: 2, endSeconds: 6 }
  ]
};

test('builds an ordered 9:16 Cloudinary Reel with audio and burned subtitles', () => {
  const url = buildCloudinaryReelUrl(baseInput);
  assert.equal(url, 'https://res.cloudinary.com/dsmg07va6/image/upload/ac_none,c_fill,g_auto,h_1920,w_1080,du_6/l_video:telegram:file_99,c_fill,g_auto,h_1920,w_1080,so_2,eo_6/fl_layer_apply,fl_splice/l_audio:reels:rec123:v1:narration/fl_layer_apply/l_subtitles:reels:rec123:v1:subtitles.en/fl_layer_apply/f_mp4/telegram/file_98.mp4');
});

test('rejects a gap in scene order before a delivery URL is made', () => {
  assert.throws(() => buildCloudinaryReelUrl({ ...baseInput, scenes: [{ ...baseInput.scenes[0], sequence: 2 }] }), /contiguous sequence/);
});

test('rejects an unsupported source type', () => {
  assert.throws(() => buildCloudinaryReelUrl({ ...baseInput, scenes: [{ ...baseInput.scenes[0], resourceType: 'raw' }] }), /image or video/);
});

test('parses a transformed Cloudinary delivery URL without using a temporary attachment URL', () => {
  assert.deepEqual(parseCloudinaryDeliveryUrl('https://res.cloudinary.com/dsmg07va6/image/upload/c_fill,w_1080/v1781162270/folder/file_98.jpg'), {
    cloudName: 'dsmg07va6', resourceType: 'image', publicId: 'folder/file_98', version: 'v1781162270'
  });
});

test('creates the complete assembly plan directly from approved scene delivery URLs', () => {
  const plan = createCloudinaryReelAssemblyPlan({
    narrationPublicId: 'reels/rec123/v1/narration', subtitlesPublicId: 'reels/rec123/v1/subtitles.en',
    scenes: [
      { sceneId: 'scene_1', sequence: 1, sourceAssetType: 'original_photo', sourcePath: 'https://res.cloudinary.com/dsmg07va6/image/upload/v1/folder/first.jpg', stillDuration: 3 },
      { sceneId: 'scene_2', sequence: 2, sourceAssetType: 'original_video', sourcePath: 'https://res.cloudinary.com/dsmg07va6/video/upload/v2/folder/second.mp4', trimStart: 1, trimEnd: 4 }
    ]
  });
  assert.equal(plan.expectedDurationSeconds, 6);
  assert.match(plan.finalReelUrl, /l_video:folder:second.*l_audio:reels:rec123:v1:narration.*l_subtitles:reels:rec123:v1:subtitles.en/);
});

test('refuses a source URL whose Cloudinary resource type conflicts with the approved scene type', () => {
  assert.throws(() => createCloudinaryReelAssemblyPlan({
    narrationPublicId: 'narration', subtitlesPublicId: 'subtitles',
    scenes: [{ sequence: 1, sourceAssetType: 'original_photo', sourcePath: 'https://res.cloudinary.com/dsmg07va6/video/upload/v1/file.mp4', stillDuration: 3 }]
  }), /source type does not match/);
});

test('allows a first video scene to use its complete source duration when no trim is approved', () => {
  const url = buildCloudinaryReelUrl({
    cloudName: 'dsmg07va6', narrationPublicId: 'narration', subtitlesPublicId: 'subtitles',
    scenes: [{ sequence: 1, resourceType: 'video', publicId: 'folder/source', durationSeconds: 8 }]
  });
  assert.match(url, /ac_none,c_fill,g_auto,h_1920,w_1080\/l_audio:narration/);
  assert.doesNotMatch(url, /w_1080,\//);
});
