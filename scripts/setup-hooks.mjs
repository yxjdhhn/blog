import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const hookDir = resolve(rootDir, '.husky');
const preCommitPath = resolve(hookDir, 'pre-commit');

mkdirSync(hookDir, { recursive: true });

if (existsSync(preCommitPath)) {
  chmodSync(preCommitPath, 0o755);
}

function readGitConfig(key) {
  try {
    return execFileSync('git', ['config', '--get', key], { cwd: rootDir, encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

try {
  const currentHookPath = readGitConfig('core.hooksPath');
  if (currentHookPath === '.husky') {
    process.exit(0);
  }

  execFileSync('git', ['config', 'core.hooksPath', '.husky'], { cwd: rootDir, stdio: 'ignore' });
} catch (error) {
  console.warn('[posts] Unable to configure git hooks automatically.');
  const currentHookPath = readGitConfig('core.hooksPath');
  console.warn(`[posts] Current core.hooksPath: ${currentHookPath ?? '(not set)'}`);
  console.warn('[posts] Fix manually (run in repo root):');
  console.warn('[posts]   git config core.hooksPath .husky');
  console.warn('[posts]   chmod +x .husky/pre-commit');
}
