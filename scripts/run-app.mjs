import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.platform === 'darwin' ? 'ios' : 'android';

process.stdout.write(`[run] Starting the ${platform} app.\n`);

const result = spawnSync('npm', ['run', platform], {
  cwd: rootDir,
  stdio: 'inherit',
});

process.exitCode = result.status ?? 1;
