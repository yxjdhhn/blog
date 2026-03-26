import {
  extractContent,
  extractJson,
  fetchJson,
  normalizeMarkdownTranslation,
  toTranslationError,
  trimTrailingSlash,
} from '../shared.mjs';

export function createOpenAICompatibleTextProvider(env) {
  const model = env.AI_TEXT_MODEL;

  return {
    name: 'openai-compatible',
    model,
    async generateTranslationMetadata(input) {
      try {
        const response = await requestChatCompletion(env, {
          model,
          messages: [
            {
              role: 'system',
              content: [
                'You translate metadata for Chinese technical blog posts into polished English.',
                'Return JSON only. Do not wrap the response in markdown fences.',
                'Use the exact keys: title, description, category, tags.',
                'The tags field must be an array of strings.',
                'Preserve product names and technical terms where appropriate.',
              ].join(' '),
            },
            {
              role: 'user',
              content: buildMetadataPrompt(input),
            },
          ],
        });

        const content = extractContent(response);
        const parsed = extractJson(content);
        return {
          title: parsed.title || input.title,
          description: parsed.description || input.description,
          category: parsed.category || input.category,
          tags: Array.isArray(parsed.tags) ? parsed.tags : input.tags,
        };
      } catch (error) {
        throw toTranslationError(error);
      }
    },
    async generateTranslationChunk(input) {
      try {
        const response = await requestChatCompletion(env, {
          model,
          messages: [
            {
              role: 'system',
              content: [
                'You translate chunks of Chinese technical blog posts into polished English.',
                'Return markdown only.',
                'Do not add explanations, introductions, or markdown fences unless the source chunk already contains them.',
                'Preserve markdown structure, links, tables, commands, code blocks, filenames, APIs, and product names.',
                'Translate natural language only.',
              ].join(' '),
            },
            {
              role: 'user',
              content: buildChunkPrompt(input),
            },
          ],
        });

        const content = extractContent(response);
        return normalizeMarkdownTranslation(content);
      } catch (error) {
        throw toTranslationError(error);
      }
    },
  };
}

async function requestChatCompletion(env, { model, messages }) {
  const apiKey = env.AI_TEXT_API_KEY || env.AI_API_KEY;
  const baseUrl = env.AI_TEXT_API_BASE_URL || env.AI_API_BASE_URL;

  if (!apiKey || !baseUrl || !model) {
    throw new Error('Missing text translation configuration.');
  }

  return fetchJson(`${trimTrailingSlash(baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages,
    }),
  });
}

function buildMetadataPrompt(input) {
  return [
    'Translate the metadata of this Chinese technical blog post into polished English.',
    'Output JSON with the exact keys: title, description, category, tags.',
    '',
    `Slug: ${input.slug}`,
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Category: ${input.category ?? ''}`,
    `Tags: ${(input.tags ?? []).join(', ')}`,
    '',
    'Article outline:',
    input.outline || '(no headings)',
  ].join('\n');
}

function buildChunkPrompt(input) {
  return [
    'Translate the following Chinese technical blog chunk into polished English.',
    'Return markdown only.',
    'Do not add any explanation before or after the translated markdown.',
    '',
    `Slug: ${input.slug}`,
    `Article title: ${input.title}`,
    `Section heading: ${input.sectionHeading ?? ''}`,
    `Previous heading: ${input.previousHeading ?? ''}`,
    `Chunk: ${input.chunkIndex + 1}/${input.chunkCount}`,
    '',
    'Chunk markdown:',
    input.body,
  ].join('\n');
}
