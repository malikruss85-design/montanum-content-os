import fs from 'node:fs/promises';
import path from 'node:path';

export class FileRepository {
  constructor(dataDir) { this.dataDir = dataDir; this.runsDir = path.join(dataDir, 'runs'); }
  async init() { await fs.mkdir(this.runsDir, { recursive: true }); }
  path(runId) { return path.join(this.runsDir, `${runId}.json`); }
  async findByRunId(runId) { try { return JSON.parse(await fs.readFile(this.path(runId), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } }
  async save(run) { await this.init(); const target = this.path(run.runId); const temporary = `${target}.tmp`; await fs.writeFile(temporary, JSON.stringify(run, null, 2)); await fs.rename(temporary, target); return run; }
}
