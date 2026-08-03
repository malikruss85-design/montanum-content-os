import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createApp } from './app.js';
import { ValidationError } from './contracts.js';
import { checkFfmpeg } from './readiness.js';

function send(response, status, value) { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(value)); }
function authorized(request, app) { return Boolean(app.config.apiToken) && request.headers.authorization === `Bearer ${app.config.apiToken}`; }
function contentType(asset) { if (asset.assetClass === 'final_publication') return 'video/mp4'; if (asset.assetClass === 'subtitle') return 'application/x-subrip; charset=utf-8'; return path.extname(asset.storageReference).toLowerCase() === '.m4a' ? 'audio/mp4' : 'audio/mpeg'; }
async function sendAsset(response, app, assetId, method) {
  const found = await app.repository.findAsset(assetId); if (!found) return send(response, 404, { error: 'Asset not found' });
  try {
    const info = await fs.promises.stat(found.asset.storageReference);
    response.writeHead(200, { 'content-type': contentType(found.asset), 'content-length': info.size, 'content-disposition': `attachment; filename="${path.basename(found.asset.storageReference)}"`, 'cache-control': 'no-store' });
    if (method === 'HEAD') return response.end();
    fs.createReadStream(found.asset.storageReference).on('error', () => response.destroy()).pipe(response);
  } catch (error) { if (error.code === 'ENOENT') return send(response, 404, { error: 'Asset unavailable' }); throw error; }
}
function readJson(request, maxBytes) {
  return new Promise((resolve, reject) => {
    let body = ''; let size = 0;
    request.on('data', chunk => { size += chunk.length; if (size > maxBytes) { reject(new ValidationError(`Request body exceeds ${maxBytes} bytes`)); request.resume(); return; } body += chunk; });
    request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new ValidationError('Invalid JSON body')); } }); request.on('error', reject);
  });
}

export function createServer(app = createApp()) {
  let ready = false; let shuttingDown = false;
  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === 'GET' && request.url === '/health') return send(response, 200, { status: 'ok', service: 'montanum-media-production-engine' });
      if (request.method === 'GET' && request.url === '/ready') return ready && !shuttingDown ? send(response, 200, { status: 'ready', renderer: 'ffmpeg' }) : send(response, 503, { status: 'not_ready' });
      if (!authorized(request, app)) return send(response, 401, { error: 'Unauthorized' });
      if ((request.method === 'GET' || request.method === 'HEAD') && /^\/v1\/assets\/asset_[a-f0-9]{24}$/.test(request.url || '')) return sendAsset(response, app, request.url.split('/').at(-1), request.method);
      if (request.method === 'POST' && request.url === '/v1/productions') { const result = await app.productionService.start(await readJson(request, app.config.maxRequestBytes)); return send(response, result.duplicate ? 200 : 201, result); }
      if (request.method === 'POST' && /^\/v1\/productions\/[^/]+\/invalidate-approval$/.test(request.url || '')) { const runId = request.url.split('/')[3]; const body = await readJson(request, app.config.maxRequestBytes); return send(response, 200, await app.productionService.invalidateApproval(runId, body.sceneVersion)); }
      return send(response, 404, { error: 'Not found' });
    } catch (error) { return send(response, error.statusCode || 500, { error: error.message }); }
  });
  server.requestTimeout = app.config.requestTimeoutMs; server.headersTimeout = app.config.headersTimeoutMs; server.keepAliveTimeout = 5_000;
  return {
    app, server,
    async listen() { if (!(await checkFfmpeg(app.config.ffmpegPath))) throw new Error(`FFmpeg unavailable at ${app.config.ffmpegPath}`); await app.repository.init(); ready = true; return new Promise(resolve => server.listen(app.config.port, app.config.host, resolve)); },
    async shutdown() { shuttingDown = true; ready = false; return new Promise(resolve => server.close(resolve)); }
  };
}

const running = createServer();
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMainModule) {
  running.listen().then(() => console.log(`Media Production Engine listening on http://${running.app.config.host}:${running.app.config.port}`)).catch(error => { console.error(error.message); process.exitCode = 1; });
  const shutdown = async () => { const timer = setTimeout(() => process.exit(1), running.app.config.shutdownTimeoutMs); await running.shutdown(); clearTimeout(timer); process.exit(0); };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
