import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCloudinaryReelUrl } from '../src/services/cloudinary-reel-url.js';

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
