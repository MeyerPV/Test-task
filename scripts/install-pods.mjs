import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const iosDir = join(rootDir, 'ios');
const isForced = process.argv.includes('--force');
const isCi = ['true', '1'].includes(String(process.env.CI).toLowerCase());

const log = message => process.stdout.write(`[pods] ${message}\n`);

const run = (command, args, cwd) =>
  spawnSync(command, args, { cwd, stdio: 'inherit' }).status === 0;

const isAvailable = command =>
  spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0;

const installWithBundler = () => {
  if (!isAvailable('bundle')) {
    log('Bundler is not available.');
    return 'unavailable';
  }
  log('Installing Ruby gems from Gemfile with Bundler.');
  if (!run('bundle', ['install'], rootDir)) {
    log('bundle install failed, Bundler is treated as unavailable.');
    return 'unavailable';
  }
  log('Running bundle exec pod install.');
  return run('bundle', ['exec', 'pod', 'install'], iosDir)
    ? 'installed'
    : 'failed';
};

const installWithGlobalPod = () => {
  if (!isAvailable('pod')) {
    log('Global CocoaPods is not available.');
    return false;
  }
  log('Running global pod install.');
  return run('pod', ['install'], iosDir);
};

const main = () => {
  if (process.platform !== 'darwin') {
    log(`Skipped on ${process.platform}: CocoaPods runs only on macOS.`);
    return 0;
  }
  if (isCi && !isForced) {
    log('Skipped on CI. Run npm run pods to install them.');
    return 0;
  }
  if (!existsSync(join(iosDir, 'Podfile'))) {
    log('Skipped: ios/Podfile not found.');
    return 0;
  }
  const bundlerResult = installWithBundler();
  if (bundlerResult === 'installed') {
    return 0;
  }
  if (bundlerResult === 'unavailable' && installWithGlobalPod()) {
    return 0;
  }
  process.stderr.write(
    '[pods] Pod installation failed. Fix the error above, then run npm run pods.\n',
  );
  return 1;
};

process.exitCode = main();
