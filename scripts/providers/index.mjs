import { createDeepSeekTextProvider } from './text/deepseek-compatible.mjs';
import { createOpenAICompatibleTextProvider } from './text/openai-compatible.mjs';
import { createGoogleGeminiImageProvider } from './image/google-gemini.mjs';
import { createProceduralLocalImageProvider } from './image/procedural-local.mjs';
import { createSiliconFlowImageProvider } from './image/siliconflow.mjs';

export function createProviders(env) {
  return {
    textProvider: createTextProvider(env),
    imageProvider: createImageProvider(env),
  };
}

function createTextProvider(env) {
  const providerName = env.AI_TEXT_PROVIDER || env.AI_PROVIDER || 'deepseek-compatible';

  if (providerName === 'deepseek-compatible') {
    return createDeepSeekTextProvider(env);
  }

  if (providerName === 'openai-compatible') {
    return createOpenAICompatibleTextProvider(env);
  }

  throw new Error(`Unsupported text provider "${providerName}".`);
}

function createImageProvider(env) {
  const providerName = resolveImageProviderName(env);
  const proceduralProvider = createProceduralLocalImageProvider();

  if (providerName === 'procedural-local') {
    return proceduralProvider;
  }

  if (providerName === 'google-gemini') {
    return createGoogleGeminiImageProvider(env, {
      fallbackProvider: proceduralProvider,
    });
  }

  if (providerName === 'siliconflow') {
    return createSiliconFlowImageProvider(env, {
      fallbackProvider: proceduralProvider,
    });
  }

  throw new Error(`Unsupported image provider "${providerName}".`);
}

function resolveImageProviderName(env) {
  if (env.AI_IMAGE_PROVIDER) {
    return env.AI_IMAGE_PROVIDER;
  }

  const apiBaseUrl = env.AI_IMAGE_API_BASE_URL || '';

  if (
    env.SILICONFLOW_API_KEY ||
    env.SILICONFLOW_API_BASE_URL ||
    env.SILICONFLOW_BASE_URL ||
    /siliconflow/i.test(apiBaseUrl)
  ) {
    return 'siliconflow';
  }

  if (env.AI_IMAGE_API_KEY || env.GOOGLE_API_KEY) {
    return 'google-gemini';
  }

  return 'procedural-local';
}
