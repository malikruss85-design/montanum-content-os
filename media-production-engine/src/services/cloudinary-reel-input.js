import { createCloudinaryReelAssemblyPlan } from './cloudinary-reel-url.js';

function readPlan(scenePlan) {
  if (typeof scenePlan === 'string') {
    try { scenePlan = JSON.parse(scenePlan); } catch { throw new Error('scenePlan must be valid JSON'); }
  }
  if (!Array.isArray(scenePlan) || scenePlan.length === 0) throw new Error('scenePlan must be a non-empty array');
  return scenePlan;
}

function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be a positive number`);
  return number;
}

function nonNegativeNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} must be a non-negative number`);
  return number;
}

function field(record, names) {
  for (const name of names) {
    if (record?.[name] != null) return record[name];
    if (record?.fields?.[name] != null) return record.fields[name];
  }
  return undefined;
}

function mediaIndex(bundleMedia) {
  if (!Array.isArray(bundleMedia) || bundleMedia.length === 0) throw new Error('bundleMedia must be a non-empty array');
  const index = new Map();
  for (const media of bundleMedia) {
    const id = field(media, ['id', 'recordId', 'record_id']);
    const sourcePath = field(media, ['sourcePath', 'fileUrl', 'file_url', 'cloudinaryUrl', 'Cloudinary URL', 'File URL']);
    if (typeof id !== 'string' || !id.trim()) throw new Error('every Bundle Media record needs an id');
    if (typeof sourcePath !== 'string' || !sourcePath.trim()) throw new Error(`Bundle Media ${id} needs a durable Cloudinary File URL`);
    if (index.has(id)) throw new Error(`duplicate Bundle Media id ${id}`);
    index.set(id, sourcePath.trim());
  }
  return index;
}

function sceneValue(scene, names) {
  for (const name of names) if (scene[name] != null) return scene[name];
  return undefined;
}

/**
 * Converts the Reel Brief JSON plus Airtable Bundle Media records into the
 * concrete source-scene shape consumed by the deterministic Cloudinary URL
 * builder. This is the join Make must make before it creates a transformation.
 */
export function createCloudinaryReelPlanFromBrief({ scenePlan, bundleMedia, narrationPublicId, subtitlesPublicId, includeSrt = false }) {
  const sources = mediaIndex(bundleMedia);
  const scenes = readPlan(scenePlan).map(scene => {
    const sequence = Number(sceneValue(scene, ['sequence']));
    if (!Number.isInteger(sequence) || sequence < 1) throw new Error('every scene needs a positive integer sequence');
    const sourceBundleMediaId = sceneValue(scene, ['source_bundle_media_id', 'sourceBundleMediaId']);
    if (typeof sourceBundleMediaId !== 'string' || !sources.has(sourceBundleMediaId)) {
      throw new Error(`scene ${sequence} references missing Bundle Media ${sourceBundleMediaId || '(empty)'}`);
    }
    const sourceAssetType = sceneValue(scene, ['source_asset_type', 'sourceAssetType']);
    const durationSeconds = positiveNumber(sceneValue(scene, ['duration_seconds', 'durationSeconds']), `scene ${sequence} durationSeconds`);
    const output = {
      sceneId: sceneValue(scene, ['scene_id', 'sceneId']) || `scene_${sequence}`,
      sequence,
      sourceAssetType,
      sourcePath: sources.get(sourceBundleMediaId),
      subtitleSegment: sceneValue(scene, ['subtitle_segment', 'subtitleSegment'])
    };
    if (['original_photo', 'render'].includes(sourceAssetType)) return { ...output, stillDuration: durationSeconds };
    if (sourceAssetType !== 'original_video') throw new Error(`scene ${sequence} has unsupported sourceAssetType`);
    const trimStart = nonNegativeNumber(sceneValue(scene, ['trim_start_seconds', 'trimStart', 'start_seconds']) ?? 0, `scene ${sequence} trimStart`);
    const trimEnd = sceneValue(scene, ['trim_end_seconds', 'trimEnd', 'end_seconds']) == null
      ? trimStart + durationSeconds
      : positiveNumber(sceneValue(scene, ['trim_end_seconds', 'trimEnd', 'end_seconds']), `scene ${sequence} trimEnd`);
    if (trimEnd <= trimStart) throw new Error(`scene ${sequence} trimEnd must be greater than trimStart`);
    return { ...output, trimStart, trimEnd };
  });
  return createCloudinaryReelAssemblyPlan({ scenes, narrationPublicId, subtitlesPublicId, includeSrt });
}
