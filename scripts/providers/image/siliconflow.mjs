import { trimTrailingSlash } from '../shared.mjs';

const DEFAULT_API_BASE_URL = 'https://api.siliconflow.cn/v1';
const DEFAULT_MODEL = 'Qwen/Qwen-Image';
const DEFAULT_IMAGE_SIZE = '1664x928';
const DEFAULT_TIMEOUT_MS = 90_000;
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1_000, 3_000, 8_000];

export function createSiliconFlowImageProvider(env, options = {}) {
  const apiKey = env.SILICONFLOW_API_KEY || null;
  const apiBaseUrl = normalizeApiBaseUrl(env.AI_IMAGE_API_BASE_URL || DEFAULT_API_BASE_URL);
  const model = env.AI_IMAGE_MODEL || DEFAULT_MODEL;
  const fallbackProvider = options.fallbackProvider;

  return {
    name: 'siliconflow',
    model,
    async generateHeroImage(input) {
      try {
        if (!apiKey) {
          throw new ImageProviderError('missing_api_key', 'Missing SiliconFlow API key.');
        }

        let lastError = null;

        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
          try {
            const payload = await requestGeneratedImage({
              apiBaseUrl,
              apiKey,
              model,
              prompt: buildPrompt(input),
              negativePrompt: buildNegativePrompt(input),
            });
            const generatedImage = extractGeneratedImage(payload);
            const downloaded = await downloadGeneratedImage(generatedImage.url);

            return {
              buffer: downloaded.buffer,
              extension: downloaded.extension,
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

async function requestGeneratedImage({ apiBaseUrl, apiKey, model, prompt, negativePrompt }) {
  const response = await fetch(`${apiBaseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      negative_prompt: negativePrompt,
      image_size: DEFAULT_IMAGE_SIZE,
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
    throw new ImageProviderError('invalid_response', 'Failed to parse SiliconFlow image response JSON.', {
      cause: error,
    });
  }

  return payload;
}

function extractGeneratedImage(payload) {
  const imageUrl = payload?.images?.[0]?.url;

  if (typeof imageUrl !== 'string' || !imageUrl) {
    throw new ImageProviderError('empty_response', 'SiliconFlow did not return a generated image URL.');
  }

  return { url: imageUrl };
}

async function downloadGeneratedImage(url) {
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    throw toImageError(error);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new ImageProviderError('download_error', `${response.status} ${response.statusText}: ${text}`, {
      status: response.status,
    });
  }

  const mimeType = response.headers.get('content-type')?.split(';', 1)[0].trim() || 'image/png';
  const arrayBuffer = await response.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    extension: extensionFromMimeType(mimeType, url),
  };
}

function buildPrompt(input) {
  const theme = resolveThemePreset(input);

  return [
    'Create a polished 16:9 cover illustration for a bilingual Chinese/English technology blog.',
    'Use a consistent premium visual language across the whole site: high-end editorial tech illustration, semi-abstract product-visual style, crisp shapes, layered lighting, soft gradients, clean negative space, strong silhouette, immediately readable at card size.',
    'Do not use article title, description, body content, or any literal scene details from the post. Base the image only on the article type and theme family.',
    `Theme family: ${theme.name}.`,
    `Core scene direction: ${theme.scene}.`,
    `Visual motifs: ${theme.motifs}.`,
    `Color direction: ${theme.palette}.`,
    'No readable text, no letters, no Chinese, no English, no slogans, no captions, no UI labels, no watermarks, no logos.',
    'Avoid photoreal people and avoid screenshot collage. Prefer clean conceptual imagery, structured geometry, elegant depth, and a unified blog-cover aesthetic.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildNegativePrompt() {
  return [
    'blurry, low resolution, clutter, noisy background, muddy lighting, weak focal point, cheap stock-photo look, meme style',
    'all readable text, letters, Chinese characters, English words, captions, slogans, subtitles, posters, labels, UI button copy, watermark, logo, brand overlay',
    'screenshot collage, pasted browser window, pasted mobile UI, multiple unrelated scenes, random props, visual chaos',
    'deformed hands, distorted faces, duplicated objects, bad anatomy, uncanny humans',
  ].join(', ');
}

function resolveThemePreset(input) {
  const tokens = [
    input.category,
    ...(input.tags ?? []),
    input.slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/(chrome devtools|devtools|debug|调试|mcp|inspect|浏览器)/i.test(tokens)) {
    return {
      name: 'developer tools',
      scene: 'a futuristic but clean debugging workspace with abstract browser panels, signal traces, layered inspection overlays, and luminous interface planes, without any readable UI text',
      motifs: 'glass panels, waveform traces, inspection markers, browser-frame silhouettes, system grids, depth layers',
      palette: 'electric blue, cyan, indigo, graphite, subtle neon highlights',
    };
  }

  if (/(ai|agent|prompt|llm|模型|智能体)/i.test(tokens)) {
    return {
      name: 'artificial intelligence',
      scene: 'a refined AI concept scene with neural lattices, flowing data ribbons, translucent compute structures, and abstract reasoning pathways',
      motifs: 'glowing nodes, network meshes, volumetric light, data particles, layered computation architecture',
      palette: 'violet, cobalt, teal, deep navy, bright luminous accents',
    };
  }

  if (/(markdown|writing|博客|blog|写作|content|editorial)/i.test(tokens)) {
    return {
      name: 'editorial content',
      scene: 'an elegant editorial-tech composition with floating document forms, composition grids, page-like panels, and structured content blocks, without readable text',
      motifs: 'paper-like planes, framing grids, card stacks, subtle cursors, layout rhythm, soft shadows',
      palette: 'warm white, graphite, ink blue, muted gold, cool gray accents',
    };
  }

  if (/(uniapp|wechat|微信|plugin|插件|mobile|app)/i.test(tokens)) {
    return {
      name: 'mobile platform engineering',
      scene: 'a polished mobile-platform scene with device silhouettes, modular plugin components, integration nodes, and app architecture forms',
      motifs: 'device frames, modular blocks, connector lines, stacked layers, system hubs, app-shell silhouettes',
      palette: 'emerald, aqua, deep blue, slate, restrained luminous edges',
    };
  }

  return {
    name: 'software engineering',
    scene: 'a premium abstract software-engineering scene with modular architecture blocks, connected systems, layered surfaces, and organized technical depth',
    motifs: 'isometric structures, component blocks, data pathways, abstract diagrams, clean perspective planes',
    palette: 'blue, indigo, slate, graphite, subtle cyan highlights',
  };
}

function normalizeApiBaseUrl(value) {
  const trimmed = trimTrailingSlash(value);

  if (/^https:\/\/cloud\.siliconflow\.cn\/?$/i.test(trimmed)) {
    return DEFAULT_API_BASE_URL;
  }

  if (trimmed.endsWith('/v1')) {
    return trimmed;
  }

  if (/^https:\/\/api\.siliconflow\.cn$/i.test(trimmed)) {
    return `${trimmed}/v1`;
  }

  return trimmed;
}

function extensionFromMimeType(mimeType, url) {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/png') return '.png';

  const match = url.match(/\.(png|jpg|jpeg|webp)(?:$|[?#])/i);
  if (match?.[1]) {
    return match[1].toLowerCase() === 'jpeg' ? '.jpg' : `.${match[1].toLowerCase()}`;
  }

  return '.png';
}

function isRetryable(error) {
  if (!(error instanceof ImageProviderError)) {
    return false;
  }

  return (
    error.code === 'timeout' ||
    error.code === 'download_error' ||
    (error.code === 'http_error' && RETRYABLE_STATUS_CODES.has(error.details?.status))
  );
}

function toImageError(error) {
  if (error instanceof ImageProviderError) {
    return error;
  }

  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return new ImageProviderError('timeout', 'The SiliconFlow image request timed out.', {
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
