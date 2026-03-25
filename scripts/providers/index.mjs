import { createDeepSeekTextProvider } from './text/deepseek-compatible.mjs';
import { createOpenAICompatibleTextProvider } from './text/openai-compatible.mjs';
import { createProceduralLocalImageProvider } from './image/procedural-local.mjs';

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
  const providerName = env.AI_IMAGE_PROVIDER || 'procedural-local';

  if (providerName === 'procedural-local') {
    return createProceduralLocalImageProvider();
  }

  throw new Error(`Unsupported image provider "${providerName}".`);
}
