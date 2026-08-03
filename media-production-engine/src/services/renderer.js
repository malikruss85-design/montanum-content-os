import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { stableAssetId } from '../ids.js';

function execute(binary, args) { return new Promise((resolve, reject) => { const child = spawn(binary, args, { windowsHide: true }); let stderr = ''; child.stderr.on('data', chunk => { stderr += chunk; }); child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}: ${stderr}`))); }); }
function duration(scene) { return ['original_photo', 'render'].includes(scene.sourceAssetType) ? scene.stillDuration : scene.trimEnd - scene.trimStart; }
function filter(scene) { return scene.fitMode === 'contain' ? 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1' : 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1'; }
function concatLine(value) { return `file '${value.replace(/'/g, "'\\''")}'`; }
function subtitlePathForFilter(file) { return file.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'"); }

export class LocalReelRenderer {
  constructor(config) { this.config = config; }
  async assertSource(scene) { await fs.access(scene.sourcePath); }
  async render({ runId, scenes, narration, subtitleText }) {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    for (const scene of scenes) await this.assertSource(scene);
    const sceneFiles = [];
    for (const scene of scenes) {
      const output = path.join(this.config.outputDir, `${runId}-scene-${scene.sequence}.mp4`);
      const args = ['-y'];
      if (['original_photo', 'render'].includes(scene.sourceAssetType)) args.push('-loop', '1', '-t', String(duration(scene)), '-i', scene.sourcePath);
      else args.push('-ss', String(scene.trimStart), '-to', String(scene.trimEnd), '-i', scene.sourcePath);
      args.push('-vf', filter(scene), '-r', '30', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output);
      await execute(this.config.ffmpegPath, args); sceneFiles.push(output);
    }
    const listPath = path.join(this.config.outputDir, `${runId}-concat.txt`);
    await fs.writeFile(listPath, `${sceneFiles.map(concatLine).join('\n')}\n`);
    const visualPath = path.join(this.config.outputDir, `${runId}-visual.mp4`);
    await execute(this.config.ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', visualPath]);
    const subtitlePath = path.join(this.config.outputDir, `${runId}.srt`);
    const totalDuration = scenes.reduce((total, scene) => total + duration(scene), 0);
    await fs.writeFile(subtitlePath, `1\n00:00:00,000 --> 00:00:${String(Math.max(1, Math.floor(totalDuration))).padStart(2, '0')},000\n${subtitleText}\n`);
    const finalPath = path.join(this.config.outputDir, `${runId}-final.mp4`);
    await execute(this.config.ffmpegPath, ['-y', '-i', visualPath, '-i', narration.storageReference, '-vf', `subtitles='${subtitlePathForFilter(subtitlePath)}'`, '-c:v', 'libx264', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', finalPath]);
    return { finalAsset: { assetId: stableAssetId(finalPath), assetClass: 'final_publication', storageReference: finalPath, durationSeconds: totalDuration }, subtitleAsset: { assetId: stableAssetId(subtitlePath), assetClass: 'subtitle', storageReference: subtitlePath } };
  }
  async validate(finalPath) {
    await fs.access(finalPath);
    try {
      await fs.access(this.config.ffprobePath);
      const output = await new Promise((resolve, reject) => { const child = spawn(this.config.ffprobePath, ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', finalPath], { windowsHide: true }); let body = ''; child.stdout.on('data', c => { body += c; }); child.on('error', reject); child.on('close', code => code === 0 ? resolve(body) : reject(new Error('ffprobe validation failed'))); });
      const data = JSON.parse(output); const stream = data.streams?.find(item => item.codec_type === 'video'); const hasAudio = data.streams?.some(item => item.codec_type === 'audio'); if (stream?.width !== 1080 || stream?.height !== 1920 || !hasAudio || !(Number(data.format?.duration) > 0)) throw new Error('Render validation failed: expected non-empty 1080x1920 MP4 with audio'); return { width: stream.width, height: stream.height, durationSeconds: Number(data.format.duration), hasAudio };
    } catch (error) {
      if (error.code && error.code !== 'ENOENT') throw error;
      const probe = await new Promise((resolve, reject) => { const child = spawn(this.config.ffmpegPath, ['-i', finalPath], { windowsHide: true }); let stderr = ''; child.stderr.on('data', c => { stderr += c; }); child.on('error', reject); child.on('close', code => (code === 0 || code === 1) ? resolve(stderr) : reject(new Error('FFmpeg fallback validation failed'))); });
      const dimensions = probe.match(/(\d{2,5})x(\d{2,5})/); const duration = probe.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/); const hasAudio = /Audio:/.test(probe); if (!dimensions || Number(dimensions[1]) !== 1080 || Number(dimensions[2]) !== 1920 || !duration || !hasAudio) throw new Error('Render validation failed: expected non-empty 1080x1920 MP4 with audio'); return { width: 1080, height: 1920, durationSeconds: Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]), hasAudio };
    }
  }
}
