import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { OpenAiTtsAdapter } from '../src/services/openai-tts.js';

test('sends English narration to OpenAI TTS and stores the returned MP3', async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mpe-openai-tts-'));
  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
  };

  try {
    const adapter = new OpenAiTtsAdapter({ outputDir, openAiApiKey: 'test-key', openAiTtsModel: 'gpt-4o-mini-tts', openAiTtsVoice: 'coral' });
    const narration = await adapter.synthesize({ requestId: 'run_123', text: 'A calm English narration.' });
    assert.equal(request.url, 'https://api.openai.com/v1/audio/speech');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(request.options.body), { model: 'gpt-4o-mini-tts', voice: 'coral', input: 'A calm English narration.', response_format: 'mp3' });
    assert.equal(narration.assetClass, 'narration');
    assert.deepEqual([...await fs.readFile(narration.storageReference)], [1, 2, 3]);
  } finally {
    global.fetch = originalFetch;
    await fs.rm(outputDir, { recursive: true, force: true });
  }
});

test('rejects OpenAI TTS without a configured key', async () => {
  const adapter = new OpenAiTtsAdapter({ outputDir: 'output', openAiApiKey: '' });
  await assert.rejects(adapter.synthesize({ requestId: 'run_123', text: 'Narration' }), /OPENAI_API_KEY/);
});
