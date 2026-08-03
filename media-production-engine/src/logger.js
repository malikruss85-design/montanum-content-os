import fs from 'node:fs/promises';
import path from 'node:path';

export function createLogger(logDir) {
  const file = path.join(logDir, 'engine.jsonl');
  async function write(level, event, data = {}) {
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(file, `${JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...data })}\n`);
  }
  return { info: (event, data) => write('info', event, data), error: (event, data) => write('error', event, data) };
}
