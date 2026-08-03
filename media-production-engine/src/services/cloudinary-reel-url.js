const CLOUDINARY_RESOURCE_TYPES = new Set(['image', 'video']);

function requirePositiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be a positive number`);
  return number;
}

function requirePublicId(publicId, label) {
  if (typeof publicId !== 'string' || !publicId.trim()) throw new Error(`${label} is required`);
  return publicId.trim().replace(/^\/+|\/+$/g, '');
}

function requireResourceType(resourceType, label) {
  if (!CLOUDINARY_RESOURCE_TYPES.has(resourceType)) throw new Error(`${label} must be image or video`);
  return resourceType;
}

function formatSeconds(value) {
  const seconds = requirePositiveNumber(value, 'durationSeconds');
  return Number.isInteger(seconds) ? String(seconds) : String(Number(seconds.toFixed(3)));
}

// Cloudinary layer public IDs use colons for folder separators.
function toLayerPublicId(publicId) {
  return requirePublicId(publicId, 'publicId').split('/').map(encodeURIComponent).join(':');
}

function sceneTransformation(scene) {
  const duration = formatSeconds(scene.durationSeconds);
  const publicId = toLayerPublicId(scene.publicId);
  const type = requireResourceType(scene.resourceType, 'scene.resourceType');
  const timing = type === 'video'
    ? [scene.startSeconds != null ? `so_${Number(scene.startSeconds)}` : null, scene.endSeconds != null ? `eo_${Number(scene.endSeconds)}` : null].filter(Boolean)
    : [`du_${duration}`];
  return `l_${type}:${publicId},c_fill,g_auto,h_1920,w_1080,${timing.join(',')}/fl_layer_apply,fl_splice`;
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
  const firstDuration = formatSeconds(first.durationSeconds);
  const baseTiming = firstType === 'video'
    ? [first.startSeconds != null ? `so_${Number(first.startSeconds)}` : null, first.endSeconds != null ? `eo_${Number(first.endSeconds)}` : null].filter(Boolean)
    : [`du_${firstDuration}`];
  const transformations = [
    `ac_none,c_fill,g_auto,h_1920,w_1080,${baseTiming.join(',')}`,
    ...ordered.slice(1).map(sceneTransformation),
    `l_audio:${toLayerPublicId(narrationPublicId)}/fl_layer_apply`,
    `l_subtitles:${toLayerPublicId(subtitlesPublicId)}/fl_layer_apply`,
    'f_mp4'
  ];
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName.trim())}/${firstType}/upload/${transformations.join('/')}/${firstPublicId}.mp4`;
}

