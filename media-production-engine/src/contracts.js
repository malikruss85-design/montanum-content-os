const sceneTypes = new Set(['original_video', 'original_photo', 'render', 'drone', 'timelapse', 'intro', 'outro']);
const fitModes = new Set(['cover', 'contain']);

export const instagramReelProfile = Object.freeze({
  profileId: 'instagram_reel_9x16', width: 1080, height: 1920, aspectRatio: '9:16', container: 'mp4', subtitleMode: 'burned_in', audioTracks: 1
});

export function validateRenderingProfile(profile) {
  if (!profile || profile.profileId !== instagramReelProfile.profileId || profile.width !== 1080 || profile.height !== 1920 || profile.aspectRatio !== '9:16') {
    throw new ValidationError('Only instagram_reel_9x16 (1080x1920) is supported by the MVP');
  }
  return profile;
}

export function validateScene(scene, index = 0) {
  const required = ['sceneId', 'sequence', 'sourceAssetId', 'sourceAssetType', 'sourcePath', 'outputAspectRatio'];
  for (const name of required) if (scene?.[name] === undefined || scene[name] === '') throw new ValidationError(`Scene ${index}: ${name} is required`);
  if (!Number.isInteger(scene.sequence) || scene.sequence < 1) throw new ValidationError(`Scene ${index}: sequence must be a positive integer`);
  if (!sceneTypes.has(scene.sourceAssetType)) throw new ValidationError(`Scene ${index}: unsupported sourceAssetType`);
  if (!fitModes.has(scene.fitMode || 'cover')) throw new ValidationError(`Scene ${index}: fitMode must be cover or contain`);
  if (scene.outputAspectRatio !== '9:16') throw new ValidationError(`Scene ${index}: MVP only supports 9:16`);
  const isStill = ['original_photo', 'render'].includes(scene.sourceAssetType);
  if (isStill && (!(scene.stillDuration > 0))) throw new ValidationError(`Scene ${index}: stillDuration must be positive for still assets`);
  if (!isStill && (!(scene.trimEnd > scene.trimStart) || scene.trimStart < 0)) throw new ValidationError(`Scene ${index}: video trimEnd must be greater than trimStart`);
  return { ...scene, fitMode: scene.fitMode || 'cover', transition: scene.transition || 'cut' };
}

export function validateScenes(scenes) {
  if (!Array.isArray(scenes) || scenes.length === 0) throw new ValidationError('At least one scene is required');
  const ids = new Set(); const sequence = new Set();
  const validated = scenes.map(validateScene).sort((a, b) => a.sequence - b.sequence);
  for (const scene of validated) {
    if (ids.has(scene.sceneId)) throw new ValidationError(`Duplicate sceneId: ${scene.sceneId}`);
    if (sequence.has(scene.sequence)) throw new ValidationError(`Duplicate sequence: ${scene.sequence}`);
    ids.add(scene.sceneId); sequence.add(scene.sequence);
  }
  return validated;
}

export function validateCommand(command) {
  if (!command || command.command !== 'start_production') throw new ValidationError('Only start_production is supported by the MVP');
  for (const field of ['idempotencyKey', 'contentId', 'bundleId']) if (!command[field] || typeof command[field] !== 'string') throw new ValidationError(`${field} is required`);
  validateRenderingProfile(command.renderingProfile || instagramReelProfile);
  const scenes = validateScenes(command.scenes);
  if (!command.voiceOverScript || typeof command.voiceOverScript !== 'string') throw new ValidationError('voiceOverScript is required');
  if (!command.subtitleText || typeof command.subtitleText !== 'string') throw new ValidationError('subtitleText is required');
  return { ...command, scenes, renderingProfile: command.renderingProfile || instagramReelProfile };
}

export function validateCallbackEvent(event) {
  for (const field of ['eventId', 'eventType', 'productionRunId', 'contentId', 'occurredAt']) if (!event?.[field]) throw new ValidationError(`Callback ${field} is required`);
  return event;
}

export class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; this.statusCode = 400; }
}
