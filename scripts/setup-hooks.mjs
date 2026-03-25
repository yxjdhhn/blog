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

try {
  execFileSync('git', ['config', 'core.hooksPath', '.husky'], { cwd: rootDir, stdio: 'ignore' });
} catch (error) {
  console.warn('[posts] Unable to configure git hooks automatically.');
}
