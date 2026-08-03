import { validateCommand } from '../contracts.js';
import { inputSignature, stableRunId } from '../ids.js';
import { MockTtsAdapter } from './mock-tts.js';
import { LocalReelRenderer } from './renderer.js';

export class ProductionService {
  constructor({ config, repository, logger }) { this.config = config; this.repository = repository; this.logger = logger; this.tts = new MockTtsAdapter(config); this.renderer = new LocalReelRenderer(config); }
  async start(command) {
    const validated = validateCommand(command); const runId = stableRunId(validated.idempotencyKey); const signature = inputSignature(validated); const existing = await this.repository.findByRunId(runId);
    if (existing) { if (existing.inputSignature !== signature) throw new Error('Idempotency key was reused with different input'); return { run: existing, duplicate: true }; }
    const run = { runId, contentId: validated.contentId, bundleId: validated.bundleId, idempotencyKey: validated.idempotencyKey, inputSignature: signature, status: 'running', scenes: validated.scenes, createdAt: new Date().toISOString(), approval: { status: 'invalidated', reason: 'new production' }, assets: [] };
    await this.repository.save(run); await this.logger.info('production_started', { runId, contentId: run.contentId });
    try {
      const durationSeconds = validated.scenes.reduce((sum, scene) => sum + (['original_photo', 'render'].includes(scene.sourceAssetType) ? scene.stillDuration : scene.trimEnd - scene.trimStart), 0);
      const narration = await this.tts.synthesize({ requestId: runId, durationSeconds });
      const rendered = await this.renderer.render({ runId, scenes: validated.scenes, narration, subtitleText: validated.subtitleText });
      const validation = await this.renderer.validate(rendered.finalAsset.storageReference);
      Object.assign(run, { status: 'succeeded', completedAt: new Date().toISOString(), assets: [narration, rendered.subtitleAsset, rendered.finalAsset], validation }); await this.repository.save(run); await this.logger.info('production_succeeded', { runId, validation }); return { run, duplicate: false };
    } catch (error) { run.status = 'failed'; run.error = { message: error.message, retryable: true }; run.completedAt = new Date().toISOString(); await this.repository.save(run); await this.logger.error('production_failed', { runId, error: error.message }); throw error; }
  }
  async invalidateApproval(runId, sceneVersion) { const run = await this.repository.findByRunId(runId); if (!run) throw new Error('Production run not found'); run.approval = { status: 'invalidated', reason: 'scene_version_changed', sceneVersion, invalidatedAt: new Date().toISOString() }; await this.repository.save(run); return run; }
}
