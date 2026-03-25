import { createOpenAICompatibleTextProvider } from './openai-compatible.mjs';

export function createDeepSeekTextProvider(env) {
  const mergedEnv = {
    ...env,
    AI_TEXT_API_BASE_URL: env.AI_TEXT_API_BASE_URL || env.AI_API_BASE_URL || 'https://api.deepseek.com',
    AI_TEXT_MODEL: env.AI_TEXT_MODEL || 'deepseek-chat',
  };

  return {
    ...createOpenAICompatibleTextProvider(mergedEnv),
    name: 'deepseek-compatible',
  };
}
