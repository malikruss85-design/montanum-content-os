import process from 'node:process';
import { createCloudinaryReelAssemblyPlan } from '../services/cloudinary-reel-url.js';
import { createCloudinaryReelPlanFromBrief } from '../services/cloudinary-reel-input.js';

let body = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { body += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(body);
    const plan = input.scenePlan != null
      ? createCloudinaryReelPlanFromBrief({ ...input, includeSrt: true })
      : createCloudinaryReelAssemblyPlan({ ...input, includeSrt: true });
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Cloudinary Reel plan error: ${error.message}\n`);
    process.exitCode = 1;
  }
});
