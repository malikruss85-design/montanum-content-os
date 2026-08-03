import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { stableAssetId } from '../ids.js';

function run(binary, args) { return new Promise((resolve, reject) => { const child = spawn(binary, args, { windowsHide: true }); let stderr = ''; child.stderr.on('data', c => { stderr += c; }); child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg failed (${code}): ${stderr}`))); }); }

export class MockTtsAdapter {
  constructor(config) { this.config = config; }
  async synthesize({ requestId, durationSeconds }) {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    const outputPath = path.join(this.config.outputDir, `${requestId}-narration.m4a`);
    if (this.config.testAudioPath) { await fs.copyFile(this.config.testAudioPath, outputPath); }
    else await run(this.config.ffmpegPath, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(durationSeconds), '-c:a', 'aac', outputPath]);
    return { assetId: stableAssetId(outputPath), assetClass: 'narration', storageReference: outputPath, durationSeconds };
  }
}
