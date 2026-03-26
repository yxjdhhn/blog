import { trimTrailingSlash } from '../shared.mjs';

const DEFAULT_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_TIMEOUT_MS = 90_000;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1_000, 3_000, 8_000];
const MAX_PROMPT_BODY_LENGTH = 1_200;
const MAX_ALLOWED_PROPER_NOUNS = 3;

export function createGoogleGeminiImageProvider(env, options = {}) {
  const apiKey = env.AI_IMAGE_API_KEY || env.GOOGLE_API_KEY || null;
  const apiBaseUrl = trimTrailingSlash(env.AI_IMAGE_API_BASE_URL || DEFAULT_API_BASE_URL);
  const model = env.AI_IMAGE_MODEL || DEFAULT_MODEL;
  const fallbackProvider = options.fallbackProvider;

  return {
    name: 'google-gemini',
    model,
    async generateHeroImage(input) {
      try {
        if (!apiKey) {
          throw new ImageProviderError('missing_api_key', 'Missing Google Gemini API key.');
        }

        let lastError = null;

        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
          try {
            const payload = await requestGeneratedImage({
              apiBaseUrl,
              apiKey,
              model,
              prompt: buildPrompt(input),
            });
            const generatedImage = extractGeneratedImage(payload);

            return {
              buffer: Buffer.from(generatedImage.data, 'base64'),
              extension: extensionFromMimeType(generatedImage.mimeType),
              status: 'complete',
            };
          } catch (error) {
            lastError = toImageError(error);

            if (!isRetryable(lastError) || attempt === RETRY_DELAYS_MS.length) {
              break;
            }

            await sleep(RETRY_DELAYS_MS[attempt]);
          }
        }

        if (fallbackProvider) {
          const fallbackImage = await fallbackProvider.generateHeroImage(input);
          return {
            ...fallbackImage,
            status: 'pending',
          };
        }

        throw lastError;
      } catch (error) {
        if (!fallbackProvider) {
          throw error;
        }

        const fallbackImage = await fallbackProvider.generateHeroImage(input);
        return {
          ...fallbackImage,
          status: 'pending',
        };
      }
    },
  };
}

async function requestGeneratedImage({ apiBaseUrl, apiKey, model, prompt }) {
  const response = await fetch(`${apiBaseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    }),
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ImageProviderError('http_error', `${response.status} ${response.statusText}: ${text}`, {
      status: response.status,
    });
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new ImageProviderError('invalid_response', 'Failed to parse Gemini image response JSON.', {
      cause: error,
    });
  }

  if (payload.promptFeedback?.blockReason) {
    throw new ImageProviderError(
      'blocked',
      `Gemini blocked image generation: ${payload.promptFeedback.blockReason}.`
    );
  }

  return payload;
}

function extractGeneratedImage(payload) {
  const parts = payload?.candidates
    ?.flatMap((candidate) => candidate?.content?.parts ?? [])
    .filter(Boolean);

  for (const part of parts ?? []) {
    if (part.inlineData?.data) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png',
      };
    }
  }

  throw new ImageProviderError('empty_response', 'Gemini did not return image data.');
}

function buildPrompt(input) {
  const bodySummary = summarizeMarkdown(input.body ?? '');
  const properNouns = extractProperNouns(input);
  const hints = [
    input.category ? `Category: ${input.category}` : null,
    Array.isArray(input.tags) && input.tags.length > 0 ? `Tags: ${input.tags.join(', ')}` : null,
    bodySummary ? `Article context: ${bodySummary}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const properNounLine =
    properNouns.length > 0
      ? `If text is absolutely necessary, only use these exact proper nouns, with no translation and no extra words: ${properNouns.join(', ')}.`
      : 'Do not render any readable text at all.';

  return [
    'Generate a polished 16:9 blog cover illustration for a bilingual Chinese/English technology blog.',
    'Visual style: realistic tech scene illustration, cinematic lighting, modern editorial composition, clean background, strong focal point, suitable as a website hero image.',
    'The image should communicate the article theme through scene, objects, interfaces, devices, diagrams, lighting, and abstract technical motifs instead of words.',
    'Do not render Chinese or English sentences, titles, slogans, labels, captions, UI chrome copy, buttons, watermarks, poster text, tag clouds, or explanatory text.',
    properNounLine,
    'If a proper noun is used, keep it subtle, short, and limited to at most 1-3 short words total.',
    'Avoid clutter, avoid meme aesthetics, avoid stock-photo faces, avoid low-quality typography, avoid screenshots pasted into the scene.',
    `Article title: ${input.title}`,
    input.description ? `Article description: ${input.description}` : null,
    hints || null,
  ]
    .filter(Boolean)
    .join('\n');
}

function summarizeMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PROMPT_BODY_LENGTH);
}

function extractProperNouns(input) {
  const text = [input.title, input.description, input.category, ...(input.tags ?? [])]
    .filter(Boolean)
    .join(' | ');
  const seen = new Set();
  const properNouns = [];

  for (const match of text.matchAll(/[A-Za-z0-9][A-Za-z0-9.+#/-]{1,}/g)) {
    const candidate = normalizeProperNoun(match[0]);
    if (!candidate || seen.has(candidate.toLowerCase())) continue;
    seen.add(candidate.toLowerCase());
    properNouns.push(candidate);
    if (properNouns.length >= MAX_ALLOWED_PROPER_NOUNS) {
      break;
    }
  }

  return properNouns;
}

function normalizeProperNoun(value) {
  const normalized = value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');

  if (normalized.length < 2) return null;
  if (/^\d+$/.test(normalized)) return null;
  if (/^(https?|www)$/i.test(normalized)) return null;

  return normalized;
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/png') return '.png';

  return '.png';
}

function isRetryable(error) {
  if (!(error instanceof ImageProviderError)) {
    return false;
  }

  return error.code === 'timeout' || (error.code === 'http_error' && RETRYABLE_STATUS_CODES.has(error.details?.status));
}

function toImageError(error) {
  if (error instanceof ImageProviderError) {
    return error;
  }

  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return new ImageProviderError('timeout', 'The Gemini image request timed out.', {
      cause: error,
    });
  }

  return new ImageProviderError('unknown', error?.message || String(error), {
    cause: error,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ImageProviderError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ImageProviderError';
    this.code = code;
    this.details = details;
  }
}
