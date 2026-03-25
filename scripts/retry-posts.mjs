import { loadEnvFiles, printSkipInstructions, retryPendingPosts, shouldSkipAutogen } from './lib/autogen.mjs';

loadEnvFiles();

if (shouldSkipAutogen()) {
  printSkipInstructions();
  process.exit(0);
}

const args = process.argv.slice(2);
const pendingOnly = args.includes('--pending');
const slug = args.find((arg) => !arg.startsWith('-'));

if (!pendingOnly && !slug) {
  console.error('[posts] Usage: npm run posts:retry -- <slug> | npm run posts:retry -- --pending');
  process.exit(1);
}

const results = await retryPendingPosts({ slug: pendingOnly ? undefined : slug });

if (results.length === 0) {
  console.log('[posts] Nothing to retry.');
  process.exit(0);
}

for (const result of results) {
  console.log(
    `[posts] Retried ${result.slug} (translation: ${result.translationStatus ?? 'n/a'}, image: ${result.imageStatus ?? 'n/a'})`
  );
}
