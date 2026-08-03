function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be a positive number`);
  return number;
}

function duration(scene) {
  if (['original_photo', 'render'].includes(scene.sourceAssetType)) return positiveNumber(scene.stillDuration, 'stillDuration');
  const start = Number(scene.trimStart); const end = Number(scene.trimEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('trimEnd must be greater than trimStart');
  return end - start;
}

export function formatSrtTimestamp(seconds) {
  const milliseconds = Math.round(Number(seconds) * 1000);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new Error('timestamp must be non-negative');
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const secs = Math.floor((milliseconds % 60_000) / 1_000);
  const millis = milliseconds % 1_000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/** Creates deterministic scene-timed English captions from the approved Reel plan. */
export function buildSceneSrt(scenes) {
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('at least one subtitle scene is required');
  const ordered = [...scenes].sort((a, b) => Number(a.sequence) - Number(b.sequence));
  let offset = 0;
  return `${ordered.map((scene, index) => {
    if (Number(scene.sequence) !== index + 1) throw new Error('subtitle scenes must have contiguous sequence numbers starting at 1');
    const text = String(scene.subtitleSegment ?? scene.subtitleText ?? '').trim();
    if (!text) throw new Error(`scene ${scene.sequence} needs approved subtitle text`);
    const start = offset; offset += duration(scene);
    return `${index + 1}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(offset)}\n${text}`;
  }).join('\n\n')}\n`;
}

