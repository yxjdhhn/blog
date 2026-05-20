import { backfillImages, loadEnvFiles, printSkipInstructions, shouldSkipAutogen } from './lib/autogen.mjs';

loadEnvFiles();

if (shouldSkipAutogen()) {
  printSkipInstructions();
  process.exit(0);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const results = await backfillImages({ force });

if (results.length === 0) {
  console.log('[posts] No image backfill candidates.');
  process.exit(0);
}

for (const result of results) {
  const action = result.changed ? 'Backfilled image for' : 'Tried image backfill for';
  const changeLabel = result.assetChanged || result.frontmatterChanged ? 'changed' : 'unchanged';
  console.log(`[posts] ${action} ${result.slug} (image: ${result.imageStatus ?? 'n/a'}, ${changeLabel})`);

  if (result.lastImageError) {
    console.log(
      `[posts] Last image error for ${result.slug}: ${result.lastImageError.code} - ${result.lastImageError.message}`
    );
  }
}
