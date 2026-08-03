import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCommand, validateRenderingProfile, ValidationError, instagramReelProfile } from '../src/contracts.js';

const valid = { command: 'start_production', idempotencyKey: 'a', contentId: 'c', bundleId: 'b', renderingProfile: instagramReelProfile, voiceOverScript: 'voice', subtitleText: 'subtitle', scenes: [{ sceneId: 's1', sequence: 1, sourceAssetId: 'a1', sourceAssetType: 'original_video', sourcePath: 'x.mp4', trimStart: 0, trimEnd: 1, outputAspectRatio: '9:16' }] };
test('validates a production command and ordered scene', () => assert.equal(validateCommand(valid).scenes[0].fitMode, 'cover'));
test('rejects duplicate scene sequences', () => assert.throws(() => validateCommand({ ...valid, scenes: [...valid.scenes, { ...valid.scenes[0], sceneId: 's2' }] }), ValidationError));
test('rejects invalid still duration', () => assert.throws(() => validateCommand({ ...valid, scenes: [{ ...valid.scenes[0], sourceAssetType: 'original_photo', stillDuration: 0 }] }), ValidationError));
test('validates only the MVP rendering profile', () => assert.throws(() => validateRenderingProfile({ ...instagramReelProfile, width: 1920 }), ValidationError));
