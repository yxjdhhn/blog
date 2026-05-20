import {
  getPostPathsByLang,
  getStagedChinesePaths,
  loadEnvFiles,
  printRetryReminder,
  printSkipInstructions,
  shouldSkipAutogen,
  syncChinesePost,
} from './lib/autogen.mjs';

loadEnvFiles();

const args = process.argv.slice(2);
const stagedOnly = args.includes('--staged');
const hookMode = args.includes('--hook');

if (shouldSkipAutogen()) {
  printSkipInstructions();
  process.exit(0);
}

const sourcePaths = stagedOnly ? getStagedChinesePaths() : getPostPathsByLang('zh');

if (sourcePaths.length === 0) {
  printRetryReminder();
  process.exit(0);
}

const results = [];

for (const sourcePath of sourcePaths) {
  results.push(await syncChinesePost(sourcePath));
}

const changed = results.filter((result) => result.changed);
const generatedPending = results.filter((result) => result.wrotePendingTranslation || result.wrotePendingImage);
const legacySkipped = results.filter((result) => result.skippedLegacyEnglish);

for (const result of changed) {
  console.log(
    `[posts] Synced ${result.slug} (translation: ${result.translationStatus ?? 'n/a'}, image: ${result.imageStatus ?? 'n/a'})`
  );
  if (result.translationProgress) {
    console.log(
      `[posts] Translation progress for ${result.slug}: ${result.translationProgress.completed}/${result.translationProgress.total} chunks complete.`
    );
  }
  if (result.lastTranslationError) {
    console.log(
      `[posts] Last translation error for ${result.slug}: ${result.lastTranslationError.code} - ${result.lastTranslationError.message}`
    );
  }
  if (result.lastImageError) {
    console.log(`[posts] Last image error for ${result.slug}: ${result.lastImageError.code} - ${result.lastImageError.message}`);
  }
}

for (const result of legacySkipped) {
  console.log(`[posts] Kept existing manual English post for ${result.slug}; only shared image automation is applied.`);
}

if (generatedPending.length > 0) {
  console.log('[posts] Some items were generated as pending drafts because AI was unavailable.');
}

if (hookMode && changed.length > 0) {
  console.log('[posts] Review the generated files, run `git add`, and commit again.');
  console.log('[posts] Skip automation temporarily via `.env` or `.env.local`: set `SKIP_BLOG_AUTOGEN=1`.');
  console.log('[posts] This is useful for offline work, API outages, or a temporary bypass.');
  console.log('[posts] Remove the variable or set it to `0` to re-enable automation.');
  process.exit(1);
}

printRetryReminder();
