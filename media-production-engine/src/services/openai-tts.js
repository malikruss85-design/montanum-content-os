import fs from 'node:fs/promises';
import path from 'node:path';
import { stableAssetId } from '../ids.js';

export class OpenAiTtsAdapter {
  constructor(config) { this.config = config; }

  async synthesize({ requestId, text }) {
    if (!this.config.openAiApiKey) throw new Error('OPENAI_API_KEY is required for OpenAI TTS');
    if (!text?.trim()) throw new Error('Voice-over text is required for OpenAI TTS');
    await fs.mkdir(this.config.outputDir, { recursive: true });
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.config.openAiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.config.openAiTtsModel, voice: this.config.openAiTtsVoice, input: text, response_format: 'mp3' })
    });
    if (!response.ok) throw new Error(`OpenAI TTS failed (${response.status}): ${await response.text()}`);
    const outputPath = path.join(this.config.outputDir, `${requestId}-narration.mp3`);
    await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    return { assetId: stableAssetId(outputPath), assetClass: 'narration', storageReference: outputPath };
  }
}
