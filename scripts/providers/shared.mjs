export async function fetchJson(url, init) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return response.json();
}

export function extractContent(payload) {
  const messageContent = payload.choices?.[0]?.message?.content;

  if (typeof messageContent === 'string') {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => {
        if (typeof part === 'string') return part;
        return part?.text ?? '';
      })
      .join('\n');
  }

  throw new Error('Unsupported chat completion response payload.');
}

export function extractJson(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : text;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error('Model did not return valid JSON.');
    }
    return JSON.parse(objectMatch[0]);
  }
}

export function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}
