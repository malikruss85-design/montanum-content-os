import process from 'node:process';
import { createCloudinaryReelAssemblyPlan } from '../services/cloudinary-reel-url.js';

let body = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { body += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(body);
    process.stdout.write(`${JSON.stringify(createCloudinaryReelAssemblyPlan({ ...input, includeSrt: true }), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Cloudinary Reel plan error: ${error.message}\n`);
    process.exitCode = 1;
  }
});

