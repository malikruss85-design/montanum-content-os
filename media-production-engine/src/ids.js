import crypto from 'node:crypto';

export function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

export function stableRunId(idempotencyKey) {
  return `run_${sha256(idempotencyKey).slice(0, 24)}`;
}

export function stableAssetId(input) {
  return `asset_${sha256(input).slice(0, 24)}`;
}

export function inputSignature(input) {
  return sha256(input);
}
