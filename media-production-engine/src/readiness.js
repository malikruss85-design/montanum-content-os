import { spawn } from 'node:child_process';

export function checkFfmpeg(binary) { return new Promise((resolve) => { const child = spawn(binary, ['-version'], { windowsHide: true }); child.on('error', () => resolve(false)); child.on('close', code => resolve(code === 0)); }); }
