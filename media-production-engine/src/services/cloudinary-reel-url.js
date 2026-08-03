const CLOUDINARY_RESOURCE_TYPES = new Set(['image', 'video']);
import { buildSceneSrt } from './srt.js';

function requirePositiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be a positive number`);
  return number;
}

function requirePublicId(publicId, label) {
  if (typeof publicId !== 'string' || !publicId.trim()) throw new Error(`${label} is required`);
  return publicId.trim().replace(/^\/+|\/+$/g, '');
}

function requireSubtitlePublicId(publicId) {
  const normalized = requirePublicId(publicId, 'subtitlesPublicId');
  if (!/\.(srt|vtt)$/i.test(normalized)) {
    throw new Error('subtitlesPublicId must include a .srt or .vtt extension');
  }
  return normalized;
}

function requireResourceType(resourceType, label) {
  if (!CLOUDINARY_RESOURCE_TYPES.has(resourceType)) throw new Error(`${label} must be image or video`);
  return resourceType;
}

function formatSeconds(value) {
  const seconds = requirePositiveNumber(value, 'durationSeconds');
  return Number.isInteger(seconds) ? String(seconds) : String(Number(seconds.toFixed(3)));
}

function trimPoint(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} must be a non-negative number`);
  return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(3)));
}

// Cloudinary layer public IDs use colons for folder separators.
function toLayerPublicId(publicId) {
  return requirePublicId(publicId, 'publicId').split('/').map(encodeURIComponent).join(':');
}

function sceneTransformation(scene) {
  const publicId = toLayerPublicId(scene.publicId);
  const type = requireResourceType(scene.resourceType, 'scene.resourceType');
  const timing = type === 'video'
    ? [scene.startSeconds != null ? `so_${trimPoint(scene.startSeconds, 'startSeconds')}` : null, scene.endSeconds != null ? `eo_${trimPoint(scene.endSeconds, 'endSeconds')}` : null].filter(Boolean)
    : [`du_${formatSeconds(scene.durationSeconds)}`];
  if (type === 'video' && timing.length === 2 && Number(scene.endSeconds) <= Number(scene.startSeconds)) throw new Error('endSeconds must be greater than startSeconds');
  return `l_${type}:${publicId},c_fill,g_auto,h_1920,w_1080${timing.length ? `,${timing.join(',')}` : ''}/fl_layer_apply,fl_splice`;
}

export function parseCloudinaryDeliveryUrl(deliveryUrl) {
  let parsed;
  try { parsed = new URL(deliveryUrl); } catch { throw new Error('deliveryUrl must be a valid URL'); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com') throw new Error('deliveryUrl must be an HTTPS res.cloudinary.com URL');
  const pieces = parsed.pathname.split('/').filter(Boolean);
  const [cloudName, resourceType, deliveryType, ...remainder] = pieces;
  if (!cloudName || !CLOUDINARY_RESOURCE_TYPES.has(resourceType) || deliveryType !== 'upload' || remainder.length === 0) throw new Error('deliveryUrl is not a Cloudinary upload delivery URL');
  const versionIndex = remainder.findIndex(piece => /^v\d+$/.test(piece));
  const publicPieces = versionIndex >= 0 ? remainder.slice(versionIndex + 1) : remainder;
  if (publicPieces.length === 0) throw new Error('deliveryUrl has no public ID');
  const last = publicPieces.pop();
  const publicId = [...publicPieces, last.replace(/\.[^.]+$/, '')].map(decodeURIComponent).join('/');
  return { cloudName: decodeURIComponent(cloudName), resourceType, publicId, version: versionIndex >= 0 ? remainder[versionIndex] : undefined };
}

function cloudinaryResourceType(scene) {
  return ['original_photo', 'render'].includes(scene.sourceAssetType) ? 'image' : 'video';
}

function sceneDuration(scene) {
  return ['original_photo', 'render'].includes(scene.sourceAssetType)
    ? requirePositiveNumber(scene.stillDuration, 'stillDuration')
    : (() => {
      const start = Number(scene.trimStart); const end = Number(scene.trimEnd);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('trimEnd must be greater than trimStart');
      return end - start;
    })();
}

/** Converts approved Content/Media Scene data into the exact deterministic Cloudinary assembly plan. */
export function createCloudinaryReelAssemblyPlan({ scenes, narrationPublicId, subtitlesPublicId, includeSrt = false }) {
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('at least one scene is required');
  const mapped = scenes.map(scene => {
    const source = parseCloudinaryDeliveryUrl(scene.sourcePath);
    const resourceType = cloudinaryResourceType(scene);
    if (source.resourceType !== resourceType) throw new Error(`source type does not match scene ${scene.sceneId || scene.sequence}`);
    return {
      sequence: Number(scene.sequence), publicId: source.publicId, resourceType,
      durationSeconds: sceneDuration(scene),
      ...(resourceType === 'video' ? { startSeconds: Number(scene.trimStart), endSeconds: Number(scene.trimEnd) } : {})
    };
  });
  const cloudNames = new Set(scenes.map(scene => parseCloudinaryDeliveryUrl(scene.sourcePath).cloudName));
  if (cloudNames.size !== 1) throw new Error('all source scenes must use the same Cloudinary cloud');
  return {
    cloudName: [...cloudNames][0],
    scenes: mapped,
    expectedDurationSeconds: mapped.reduce((total, scene) => total + scene.durationSeconds, 0),
    narrationPublicId: requirePublicId(narrationPublicId, 'narrationPublicId'),
    subtitlesPublicId: requireSubtitlePublicId(subtitlesPublicId),
    finalReelUrl: buildCloudinaryReelUrl({ cloudName: [...cloudNames][0], scenes: mapped, narrationPublicId, subtitlesPublicId }),
    ...(includeSrt ? { srt: buildSceneSrt(scenes) } : {})
  };
}

/**
 * Builds a deterministic Cloudinary delivery URL for a 9:16 Reel. It performs
 * no network request and is intentionally shared with tests/documentation so
 * Make can assemble the same transformation string without a Render worker.
 */
export function buildCloudinaryReelUrl({ cloudName, scenes, narrationPublicId, subtitlesPublicId }) {
  if (typeof cloudName !== 'string' || !cloudName.trim()) throw new Error('cloudName is required');
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('at least one scene is required');
  const ordered = [...scenes].sort((a, b) => Number(a.sequence) - Number(b.sequence));
  if (ordered.some((scene, index) => !Number.isInteger(Number(scene.sequence)) || Number(scene.sequence) !== index + 1)) {
    throw new Error('scenes must have contiguous sequence numbers starting at 1');
  }
  const first = ordered[0];
  const firstType = requireResourceType(first.resourceType, 'first scene.resourceType');
  const firstPublicId = requirePublicId(first.publicId, 'first scene.publicId');
  const baseTiming = firstType === 'video'
    ? [first.startSeconds != null ? `so_${trimPoint(first.startSeconds, 'startSeconds')}` : null, first.endSeconds != null ? `eo_${trimPoint(first.endSeconds, 'endSeconds')}` : null].filter(Boolean)
    : [`du_${formatSeconds(first.durationSeconds)}`];
  if (firstType === 'video' && baseTiming.length === 2 && Number(first.endSeconds) <= Number(first.startSeconds)) throw new Error('endSeconds must be greater than startSeconds');
  const transformations = [
    `ac_none,c_fill,g_auto,h_1920,w_1080${baseTiming.length ? `,${baseTiming.join(',')}` : ''}`,
    ...ordered.slice(1).map(sceneTransformation),
    `l_audio:${toLayerPublicId(narrationPublicId)}/fl_layer_apply`,
    `l_subtitles:${toLayerPublicId(requireSubtitlePublicId(subtitlesPublicId))}/fl_layer_apply`,
    'f_mp4'
  ];
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName.trim())}/${firstType}/upload/${transformations.join('/')}/${firstPublicId}.mp4`;
}
