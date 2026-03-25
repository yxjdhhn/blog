import { extractContent, extractJson, fetchJson, trimTrailingSlash } from '../shared.mjs';

export function createOpenAICompatibleTextProvider(env) {
  return {
    name: 'openai-compatible',
    async generateTranslation(input) {
      const apiKey = env.AI_TEXT_API_KEY || env.AI_API_KEY;
      const baseUrl = env.AI_TEXT_API_BASE_URL || env.AI_API_BASE_URL;
      const model = env.AI_TEXT_MODEL;

      if (!apiKey || !baseUrl || !model) {
        throw new Error('Missing text translation configuration.');
      }

      const response = await fetchJson(`${trimTrailingSlash(baseUrl)}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: [
                'You translate Chinese technical blog posts into polished English.',
                'Return JSON only. Do not wrap the response in markdown fences.',
                'Preserve markdown structure, code blocks, links, tables, commands, product names, and library names.',
                'Translate natural language only.',
              ].join(' '),
            },
            {
              role: 'user',
              content: buildTranslationPrompt(input),
            },
          ],
        }),
      });

      const content = extractContent(response);
      const parsed = extractJson(content);
      return {
        title: parsed.title || input.title,
        description: parsed.description || input.description,
        category: parsed.category || input.category,
        tags: Array.isArray(parsed.tags) ? parsed.tags : input.tags,
        body: parsed.body || input.body,
      };
    },
  };
}

function buildTranslationPrompt(input) {
  return [
    'Translate the following Chinese technical blog post into polished English.',
    'Output a JSON object with the exact keys: title, description, category, tags, body.',
    'The tags field must be an array of strings.',
    'Do not translate the slug.',
    '',
    `Slug: ${input.slug}`,
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Category: ${input.category ?? ''}`,
    `Tags: ${(input.tags ?? []).join(', ')}`,
    '',
    'Body:',
    input.body,
  ].join('\n');
}
