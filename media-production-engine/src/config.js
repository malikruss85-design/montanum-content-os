import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const positiveInteger = (value, name) => { const number = Number(value); if (!Number.isInteger(number) || number <= 0) throw new Error(`${name} must be a positive integer`); return number; };

export function loadConfig(env = process.env) {
  const environment = env.MPE_ENV || 'development';
  const ffmpegPath = env.MPE_FFMPEG_PATH || 'ffmpeg';
  const config = {
    root,
    environment,
    host: env.MPE_HOST || '127.0.0.1',
    port: positiveInteger(env.MPE_PORT || env.PORT || 4317, 'MPE_PORT'),
    apiToken: env.MPE_API_TOKEN || '',
    callbackUrl: env.MPE_CALLBACK_URL || '',
    callbackToken: env.MPE_CALLBACK_TOKEN || '',
    callbackSigningSecret: env.MPE_CALLBACK_SIGNING_SECRET || '',
    dataDir: path.resolve(root, env.MPE_DATA_DIR || 'data'),
    logDir: path.resolve(root, env.MPE_LOG_DIR || 'logs'),
    outputDir: path.resolve(root, env.MPE_OUTPUT_DIR || 'output'),
    ffmpegPath,
    ffprobePath: env.MPE_FFPROBE_PATH || ffmpegPath.replace(/ffmpeg(?:\.exe)?$/i, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'),
    testAudioPath: env.MPE_TEST_AUDIO_PATH || '',
    ttsProvider: env.MPE_TTS_PROVIDER || (env.OPENAI_API_KEY ? 'openai' : 'mock'),
    openAiApiKey: env.OPENAI_API_KEY || '',
    openAiTtsModel: env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
    openAiTtsVoice: env.OPENAI_TTS_VOICE || 'coral',
    maxRequestBytes: positiveInteger(env.MPE_MAX_REQUEST_BYTES || 2_000_000, 'MPE_MAX_REQUEST_BYTES'),
    requestTimeoutMs: positiveInteger(env.MPE_REQUEST_TIMEOUT_MS || 30_000, 'MPE_REQUEST_TIMEOUT_MS'),
    headersTimeoutMs: positiveInteger(env.MPE_HEADERS_TIMEOUT_MS || 35_000, 'MPE_HEADERS_TIMEOUT_MS'),
    shutdownTimeoutMs: positiveInteger(env.MPE_SHUTDOWN_TIMEOUT_MS || 10_000, 'MPE_SHUTDOWN_TIMEOUT_MS')
  };
  validateConfig(config); return config;
}

export function validateConfig(config) {
  if (!['mock', 'openai'].includes(config.ttsProvider)) throw new Error('MPE_TTS_PROVIDER must be mock or openai');
  if (config.ttsProvider === 'openai' && !config.openAiApiKey) throw new Error('OPENAI_API_KEY is required when MPE_TTS_PROVIDER=openai');
  if (config.environment === 'production' && !config.apiToken) throw new Error('MPE_API_TOKEN is required when MPE_ENV=production');
  if (config.callbackUrl && (!config.callbackToken || !config.callbackSigningSecret)) throw new Error('MPE_CALLBACK_TOKEN and MPE_CALLBACK_SIGNING_SECRET are required when MPE_CALLBACK_URL is set');
  if (config.environment === 'production' && config.host === '0.0.0.0' && !config.apiToken) throw new Error('Public production bind requires MPE_API_TOKEN');
}
