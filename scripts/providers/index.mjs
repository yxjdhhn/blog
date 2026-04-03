import { createDeepSeekTextProvider } from './text/deepseek-compatible.mjs';
import { createProceduralLocalImageProvider } from './image/procedural-local.mjs';
import { createSiliconFlowImageProvider } from './image/siliconflow.mjs';

export function createProviders(env) {
  return {
    textProvider: createTextProvider(env),
    imageProvider: createImageProvider(env),
  };
}

function createTextProvider(env) {
  const providerName = env.AI_TEXT_PROVIDER || 'deepseek-compatible';

  if (providerName !== 'deepseek-compatible') {
    throw new Error(`Unsupported text provider "${providerName}". Only "deepseek-compatible" is supported.`);
  }

  return createDeepSeekTextProvider(env);
}

function createImageProvider(env) {
  const providerName = env.AI_IMAGE_PROVIDER || 'siliconflow';
  const proceduralProvider = createProceduralLocalImageProvider();

  if (providerName === 'procedural-local') {
    return proceduralProvider;
  }

  if (providerName === 'siliconflow') {
    return createSiliconFlowImageProvider(env, {
      fallbackProvider: proceduralProvider,
    });
  }

  throw new Error(`Unsupported image provider "${providerName}".`);
}
