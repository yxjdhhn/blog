export class TranslationProviderError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'TranslationProviderError';
    this.code = code;
    this.details = details;
  }
}

export async function fetchJson(url, init = {}) {
  const { timeoutMs = 90_000, signal, ...rest } = init;
  const controllerSignal = signal ?? AbortSignal.timeout(timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      ...rest,
      signal: controllerSignal,
    });
  } catch (error) {
    throw toTranslationError(error);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new TranslationProviderError(
      'http_error',
      `${response.status} ${response.statusText}: ${message}`,
      { status: response.status }
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new TranslationProviderError('unknown', 'Failed to parse JSON response payload.', {
      cause: error,
    });
  }
}

export function extractContent(payload) {
  const messageContent = payload.choices?.[0]?.message?.content;

  if (typeof messageContent === 'string') {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    const text = messageContent
      .map((part) => {
        if (typeof part === 'string') return part;
        return part?.text ?? '';
      })
      .join('\n');

    if (text.trim()) {
      return text;
    }
  }

  throw new TranslationProviderError('empty_response', 'Model returned an empty response payload.');
}

export function extractJson(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : text;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new TranslationProviderError('invalid_json', 'Model did not return valid JSON.', {
        preview: candidate.slice(0, 500),
      });
    }
    try {
      return JSON.parse(objectMatch[0]);
    } catch (nestedError) {
      throw new TranslationProviderError('invalid_json', 'Model returned malformed JSON.', {
        preview: candidate.slice(0, 500),
        cause: nestedError,
      });
    }
  }
}

export function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

export function normalizeMarkdownTranslation(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new TranslationProviderError('empty_response', 'Model returned an empty translation body.');
  }

  const fencedMatch = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);
  return (fencedMatch ? fencedMatch[1] : trimmed).trimEnd();
}

export function toTranslationError(error) {
  if (error instanceof TranslationProviderError) {
    return error;
  }

  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return new TranslationProviderError('timeout', 'The translation request timed out.', {
      cause: error,
    });
  }

  return new TranslationProviderError('unknown', error?.message || String(error), {
    cause: error,
  });
}
