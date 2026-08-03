import fs from 'node:fs/promises';
import path from 'node:path';

const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'video/mp4': '.mp4', 'video/quicktime': '.mov' };
const supportedTypes = new Set(Object.keys(extensions));

function allowedHost(hostname, allowedHosts) { return allowedHosts.some(host => hostname === host || hostname.endsWith(`.${host}`)); }
function extensionFor(url, contentType) { return extensions[contentType] || path.extname(url.pathname).toLowerCase() || '.bin'; }

export class SourceMediaService {
  constructor(config) { this.config = config; }
  async prepareScenes(runId, scenes) { return Promise.all(scenes.map((scene) => this.prepareScene(runId, scene))); }
  async prepareScene(runId, scene) {
    if (!/^https:\/\//i.test(scene.sourcePath)) return scene;
    const url = new URL(scene.sourcePath);
    if (!allowedHost(url.hostname.toLowerCase(), this.config.allowedSourceHosts)) throw new Error(`Source host is not allowed: ${url.hostname}`);
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), this.config.sourceDownloadTimeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal, redirect: 'error' });
      if (!response.ok) throw new Error(`Source download failed (${response.status})`);
      const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
      if (!supportedTypes.has(contentType)) throw new Error(`Unsupported source content type: ${contentType || 'missing'}`);
      if (scene.sourceAssetType === 'original_video' && !contentType.startsWith('video/')) throw new Error('Original video scene requires a video source');
      if (['original_photo', 'render'].includes(scene.sourceAssetType) && !contentType.startsWith('image/')) throw new Error('Still scene requires an image source');
      const declaredLength = Number(response.headers.get('content-length') || 0);
      if (declaredLength > this.config.sourceDownloadMaxBytes) throw new Error('Source download exceeds configured size limit');
      const body = Buffer.from(await response.arrayBuffer());
      if (body.length > this.config.sourceDownloadMaxBytes) throw new Error('Source download exceeds configured size limit');
      const directory = path.join(this.config.inputDir, runId); await fs.mkdir(directory, { recursive: true });
      const localPath = path.join(directory, `${String(scene.sequence).padStart(3, '0')}-${scene.sourceAssetId}${extensionFor(url, contentType)}`);
      await fs.writeFile(localPath, body); return { ...scene, sourcePath: localPath, sourceUrl: url.toString() };
    } finally { clearTimeout(timer); }
  }
}
