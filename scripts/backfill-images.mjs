import { backfillImages, loadEnvFiles, printSkipInstructions, shouldSkipAutogen } from './lib/autogen.mjs';

loadEnvFiles();

if (shouldSkipAutogen()) {
  printSkipInstructions();
  process.exit(0);
}

const slugs = await backfillImages({ force: false });

if (slugs.length === 0) {
  console.log('[posts] No image backfill needed.');
  process.exit(0);
}

for (const slug of slugs) {
  console.log(`[posts] Backfilled image for ${slug}`);
}
