import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseMarkdownFile, stringifyMarkdownFile } from './markdown.mjs';
import { createProviders } from '../providers/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = resolve(__dirname, '../..');
export const CONTENT_DIR = resolve(ROOT_DIR, 'src/content/blog');
export const ASSET_DIR = resolve(ROOT_DIR, 'src/assets/blog/generated');
export const PENDING_BODY = `## Translation Pending

The AI translation step was unavailable during the last sync attempt.

- Retry a single post: \`npm run posts:retry -- <slug>\`
- Retry all pending posts: \`npm run posts:retry -- --pending\`

After the retry succeeds, stage the updated files and commit again.`;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
const MANAGED_TRANSLATION_STATUSES = new Set(['complete', 'pending']);

export function loadEnvFiles() {
  for (const fileName of ['.env', '.env.local']) {
    const filePath = resolve(ROOT_DIR, fileName);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

export function shouldSkipAutogen() {
  return process.env.SKIP_BLOG_AUTOGEN === '1';
}

export function getPostPathsByLang(lang) {
  const langDir = resolve(CONTENT_DIR, lang);
  if (!existsSync(langDir)) return [];

  return readdirSync(langDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => resolve(langDir, file))
    .sort();
}

export function getAllPostPaths() {
  return [...getPostPathsByLang('zh'), ...getPostPathsByLang('en')];
}

export function readPost(postPath) {
  const raw = readFileSync(postPath, 'utf8');
  const parsed = parseMarkdownFile(raw);
  if (Array.isArray(parsed.data.tags)) {
    parsed.data.tags = parsed.data.tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return {
    path: postPath,
    lang: getLangFromPath(postPath),
    slug: getSlugFromPath(postPath),
    ext: extname(postPath),
    data: parsed.data,
    body: parsed.body,
  };
}

export function writePost(postPath, post) {
  mkdirSync(dirname(postPath), { recursive: true });
  writeFileSync(postPath, stringifyMarkdownFile(post.data, post.body), 'utf8');
}

export function getTargetEnglishPath(sourcePost) {
  return resolve(CONTENT_DIR, 'en', `${sourcePost.slug}${sourcePost.ext}`);
}

export function getSourceChinesePath(slug, extension = '.md') {
  return resolve(CONTENT_DIR, 'zh', `${slug}${extension}`);
}

export function getImageAssetPath(slug, extension = '.svg') {
  return resolve(ASSET_DIR, `${slug}${extension}`);
}

export function getRelativeAssetPath(postPath, assetPath) {
  return normalizePath(relative(dirname(postPath), assetPath));
}

export function createSourceHash(post) {
  const payload = JSON.stringify({
    title: post.data.title ?? '',
    description: post.data.description ?? '',
    tags: post.data.tags ?? [],
    category: post.data.category ?? '',
    body: post.body ?? '',
  });

  return createHash('sha256').update(payload).digest('hex');
}

export function listPendingStatuses() {
  return getAllPostPaths()
    .map((postPath) => readPost(postPath))
    .filter((post) => post.data.translationStatus === 'pending' || post.data.imageStatus === 'pending')
    .map((post) => ({
      slug: post.slug,
      lang: post.lang,
      translationStatus: post.data.translationStatus,
      imageStatus: post.data.imageStatus,
    }));
}

export function getStagedChinesePaths() {
  const output = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--', 'src/content/blog/zh'],
    { cwd: ROOT_DIR, encoding: 'utf8' }
  ).trim();

  if (!output) return [];

  return output
    .split('\n')
    .map((file) => resolve(ROOT_DIR, file))
    .filter((file) => existsSync(file))
    .sort();
}

export function printSkipInstructions() {
  console.log('[posts] Auto generation skipped because `SKIP_BLOG_AUTOGEN=1`.');
  console.log('[posts] Edit `.env` or `.env.local`, set `SKIP_BLOG_AUTOGEN=1`, and commit normally.');
  console.log('[posts] This disables auto translation and auto cover generation for offline or temporary work.');
  console.log('[posts] Remove the variable or set it back to `0` to re-enable automation.');
}

export function printRetryReminder() {
  const pendingItems = listPendingStatuses();
  if (pendingItems.length === 0) return;

  console.log('[posts] Pending AI drafts detected. Commit is allowed, but these items still need attention:');
  for (const item of pendingItems) {
    console.log(`- ${item.lang}/${item.slug} (translation: ${item.translationStatus ?? 'n/a'}, image: ${item.imageStatus ?? 'n/a'})`);
  }
  console.log('[posts] Retry one post: `npm run posts:retry -- <slug>`');
  console.log('[posts] Retry all pending posts: `npm run posts:retry -- --pending`');
}

export async function syncChinesePost(sourcePath, options = {}) {
  const sourcePost = readPost(sourcePath);
  const sourceHash = createSourceHash(sourcePost);
  const targetPath = getTargetEnglishPath(sourcePost);
  const targetPost = existsSync(targetPath) ? readPost(targetPath) : null;

  const { textProvider, imageProvider } = createProviders(process.env);
  const result = {
    slug: sourcePost.slug,
    changed: false,
    translationStatus: targetPost?.data.translationStatus,
    imageStatus: sourcePost.data.imageStatus,
    wrotePendingTranslation: false,
    wrotePendingImage: false,
    skippedLegacyEnglish: false,
  };

  const legacyEnglish = targetPost && !targetPost.data.generatedFrom && !targetPost.data.sourceHash;
  const currentPendingTranslation = Boolean(
    targetPost &&
      targetPost.data.generatedFrom === 'zh' &&
      targetPost.data.sourceHash === sourceHash &&
      targetPost.data.translationStatus === 'pending'
  );

  if (!legacyEnglish) {
    const translationNeeded =
      !targetPost ||
      !MANAGED_TRANSLATION_STATUSES.has(targetPost.data.translationStatus) ||
      targetPost.data.sourceHash !== sourceHash ||
      options.retryTranslation === true;

    if (translationNeeded) {
      if (!options.retryTranslation && currentPendingTranslation) {
        result.translationStatus = 'pending';
      } else {
        const translated = await generateEnglishDraft(sourcePost, sourceHash, textProvider);
        const nextEnglish = {
          data: {
            ...(targetPost?.data ?? {}),
            title: translated.title,
            description: translated.description,
            pubDate: formatDateValue(sourcePost.data.pubDate),
            updatedDate: sourcePost.data.updatedDate ? formatDateValue(sourcePost.data.updatedDate) : undefined,
            tags: translated.tags,
            category: translated.category,
            heroImage: translated.heroImage,
            draft: sourcePost.data.draft ?? false,
            generatedFrom: 'zh',
            sourceHash,
            translationStatus: translated.translationStatus,
            imageStatus: targetPost?.data.imageStatus,
          },
          body: translated.body,
        };

        writePost(targetPath, nextEnglish);
        result.changed = true;
        result.translationStatus = translated.translationStatus;
        result.wrotePendingTranslation = translated.translationStatus === 'pending';
      }
    }
  } else {
    result.skippedLegacyEnglish = true;
  }

  const imageSyncResult = await ensureSharedImage({
    slug: sourcePost.slug,
    sourcePost,
    companionPostPath: targetPath,
    imageProvider,
    retry: options.retryImage === true,
  });

  if (imageSyncResult.changed) {
    result.changed = true;
  }

  result.imageStatus = imageSyncResult.status;
  result.wrotePendingImage = imageSyncResult.status === 'pending' && imageSyncResult.changed;

  if (existsSync(targetPath)) {
    const updatedEnglish = readPost(targetPath);
    result.translationStatus = updatedEnglish.data.translationStatus;
    result.imageStatus = updatedEnglish.data.imageStatus;
  }

  return result;
}

export async function backfillImages(options = {}) {
  const { imageProvider } = createProviders(process.env);
  const groups = groupPostsBySlug();
  const changedSlugs = [];

  for (const [slug, posts] of groups.entries()) {
    const sourcePost = posts.find((post) => post.lang === 'zh') ?? posts[0];
    const zhPath = posts.find((post) => post.lang === 'zh')?.path ?? sourcePost.path;
    const enPath = posts.find((post) => post.lang === 'en')?.path ?? null;

    const shouldRefresh = posts.some((post) => {
      const heroImage = String(post.data.heroImage ?? '');
      return options.force === true || !heroImage || heroImage.startsWith('/images/') || post.data.imageStatus === 'pending';
    });

    if (!shouldRefresh) continue;

    const result = await ensureSharedImage({
      slug,
      sourcePost,
      companionPostPath: enPath,
      imageProvider,
      retry: true,
      sourceOverridePath: zhPath,
    });

    if (result.changed) {
      changedSlugs.push(slug);
    }
  }

  return changedSlugs;
}

export async function retryPendingPosts(options = {}) {
  const groups = groupPostsBySlug();
  const { imageProvider } = createProviders(process.env);
  const targets = [];

  if (options.slug) {
    const posts = groups.get(options.slug);
    if (!posts) {
      throw new Error(`No post found for slug "${options.slug}".`);
    }
    targets.push([options.slug, posts]);
  } else {
    for (const entry of groups.entries()) {
      const [, posts] = entry;
      if (
        posts.some((post) => post.data.translationStatus === 'pending' || post.data.imageStatus === 'pending')
      ) {
        targets.push(entry);
      }
    }
  }

  const results = [];

  for (const [slug, posts] of targets) {
    const zhPost = posts.find((post) => post.lang === 'zh');
    const enPost = posts.find((post) => post.lang === 'en');

    if (zhPost && enPost?.data.translationStatus === 'pending') {
      const syncResult = await syncChinesePost(zhPost.path, {
        retryTranslation: true,
        retryImage: true,
      });
      results.push(syncResult);
      continue;
    }

    if (zhPost) {
      const imageResult = await ensureSharedImage({
        slug,
        sourcePost: zhPost,
        companionPostPath: enPost?.path ?? null,
        imageProvider,
        retry: true,
      });
      results.push({
        slug,
        changed: imageResult.changed,
        translationStatus: enPost?.data.translationStatus,
        imageStatus: imageResult.status,
      });
      continue;
    }

    if (enPost?.data.imageStatus === 'pending') {
      const imageResult = await ensureSharedImage({
        slug,
        sourcePost: enPost,
        companionPostPath: null,
        imageProvider,
        retry: true,
      });
      results.push({
        slug,
        changed: imageResult.changed,
        translationStatus: enPost.data.translationStatus,
        imageStatus: imageResult.status,
      });
    }
  }

  return results;
}

function groupPostsBySlug() {
  const groups = new Map();

  for (const postPath of getAllPostPaths()) {
    const post = readPost(postPath);
    if (!groups.has(post.slug)) {
      groups.set(post.slug, []);
    }
    groups.get(post.slug).push(post);
  }

  return groups;
}

async function generateEnglishDraft(sourcePost, sourceHash, textProvider) {
  try {
    const translation = await textProvider.generateTranslation({
      slug: sourcePost.slug,
      title: sourcePost.data.title,
      description: sourcePost.data.description,
      category: sourcePost.data.category,
      tags: sourcePost.data.tags ?? [],
      body: sourcePost.body,
    });

    return {
      ...translation,
      translationStatus: 'complete',
      heroImage: undefined,
      sourceHash,
    };
  } catch (error) {
    return {
      title: sourcePost.data.title,
      description: sourcePost.data.description,
      category: sourcePost.data.category,
      tags: sourcePost.data.tags ?? [],
      body: `${PENDING_BODY}\n\n---\n\n${sourcePost.body.trim()}\n`,
      translationStatus: 'pending',
      heroImage: undefined,
      sourceHash,
    };
  }
}

async function ensureSharedImage({
  slug,
  sourcePost,
  companionPostPath,
  imageProvider,
  retry = false,
  sourceOverridePath,
}) {
  const managedPosts = [sourcePost.path, companionPostPath].filter(Boolean);
  const existingStatuses = managedPosts
    .map((postPath) => readPost(postPath))
    .map((post) => post.data.imageStatus)
    .filter(Boolean);
  const hasPending = existingStatuses.includes('pending');
  const hasManagedImage = managedPosts
    .map((postPath) => readPost(postPath))
    .some((post) => {
      const heroImage = String(post.data.heroImage ?? '');
      return heroImage && !heroImage.startsWith('/images/');
    });

  if (!retry && hasManagedImage && !hasPending) {
    return { changed: false, status: 'complete' };
  }

  let imageResult;
  try {
    imageResult = await imageProvider.generateHeroImage({
      slug,
      title: sourcePost.data.title,
      description: sourcePost.data.description,
      category: sourcePost.data.category,
      tags: sourcePost.data.tags ?? [],
      body: sourcePost.body,
    });
  } catch (error) {
    imageResult = createFallbackSvg(slug);
    imageResult.status = 'pending';
  }

  const assetPath = writeGeneratedImage(slug, imageResult.extension, imageResult.buffer);
  const postPaths = Array.from(new Set([sourceOverridePath ?? sourcePost.path, companionPostPath].filter(Boolean)));
  let changed = false;

  for (const postPath of postPaths) {
    const post = readPost(postPath);
    const nextHeroImage = getRelativeAssetPath(postPath, assetPath);

    if (post.data.heroImage !== nextHeroImage || post.data.imageStatus !== imageResult.status) {
      post.data.heroImage = nextHeroImage;
      post.data.imageStatus = imageResult.status;
      writePost(postPath, post);
      changed = true;
    }
  }

  return { changed, status: imageResult.status };
}

function writeGeneratedImage(slug, extension, buffer) {
  const assetPath = getImageAssetPath(slug, extension);
  mkdirSync(dirname(assetPath), { recursive: true });
  deleteGeneratedImages(slug, assetPath);
  writeFileSync(assetPath, buffer);
  return assetPath;
}

function deleteGeneratedImages(slug, currentPath) {
  const dir = dirname(getImageAssetPath(slug, '.svg'));
  const baseName = slug.split('/').pop();

  if (!existsSync(dir)) return;

  for (const file of readdirSync(dir)) {
    if (file.startsWith(`${baseName}.`)) {
      const candidate = resolve(dir, file);
      if (candidate !== currentPath && IMAGE_EXTENSIONS.includes(extname(candidate))) {
        rmSync(candidate, { force: true });
      }
    }
  }
}

function createFallbackSvg(slug) {
  const hue = hashNumber(slug) % 360;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 72% 58%)" />
      <stop offset="100%" stop-color="hsl(${(hue + 70) % 360} 68% 42%)" />
    </linearGradient>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)" />
  <circle cx="1160" cy="240" r="220" fill="rgba(255,255,255,0.22)" />
  <circle cx="360" cy="780" r="320" fill="rgba(255,255,255,0.14)" />
  <path d="M210 255C392 120 620 142 816 254C1040 382 1244 404 1400 264" stroke="rgba(255,255,255,0.35)" stroke-width="28" stroke-linecap="round"/>
  <path d="M120 620C332 494 580 500 828 614C1066 728 1262 734 1418 640" stroke="rgba(255,255,255,0.28)" stroke-width="24" stroke-linecap="round"/>
  <path d="M120 864C302 744 504 736 730 830C958 924 1188 932 1422 804" stroke="rgba(255,255,255,0.22)" stroke-width="18" stroke-linecap="round"/>
</svg>`;

  return {
    buffer: Buffer.from(svg),
    extension: '.svg',
    status: 'pending',
  };
}

function getLangFromPath(postPath) {
  return normalizePath(relative(CONTENT_DIR, postPath)).split('/')[0];
}

function getSlugFromPath(postPath) {
  const relativePath = normalizePath(relative(CONTENT_DIR, postPath));
  return relativePath.replace(/^(zh|en)\//, '').replace(/\.(md|mdx)$/, '');
}

function normalizePath(value) {
  return value.split('\\').join('/');
}

function hashNumber(value) {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function formatDateValue(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}
