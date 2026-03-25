const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const ORDERED_KEYS = [
  'title',
  'description',
  'pubDate',
  'updatedDate',
  'tags',
  'category',
  'heroImage',
  'draft',
  'generatedFrom',
  'sourceHash',
  'translationStatus',
  'imageStatus',
];

export function parseMarkdownFile(raw) {
  const match = raw.match(FRONTMATTER_RE);

  if (!match) {
    return { data: {}, body: raw };
  }

  const [, frontmatter, body] = match;
  const data = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    const entry = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!entry) {
      continue;
    }

    const [, key, rawValue] = entry;
    data[key] = parseValue(rawValue.trim());
  }

  return { data, body };
}

export function stringifyMarkdownFile(data, body) {
  const keys = [
    ...ORDERED_KEYS.filter((key) => key in data && data[key] !== undefined),
    ...Object.keys(data).filter((key) => !ORDERED_KEYS.includes(key) && data[key] !== undefined),
  ];

  const frontmatter = keys.map((key) => `${key}: ${formatValue(data[key])}`).join('\n');
  const normalizedBody = body.replace(/^\s+/, '').trimEnd();
  return `---\n${frontmatter}\n---\n\n${normalizedBody}\n`;
}

function parseValue(rawValue) {
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;
  if (rawValue === 'null') return null;

  if ((rawValue.startsWith("'") && rawValue.endsWith("'")) || (rawValue.startsWith('"') && rawValue.endsWith('"'))) {
    return unescapeQuoted(rawValue.slice(1, -1));
  }

  if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    const inner = rawValue.slice(1, -1).trim();
    if (!inner) return [];

    const entries = inner.match(/'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|[^,\s][^,]*/g) ?? [];
    return entries.map((part) => parseValue(part.trim())).filter((value) => value !== undefined);
  }

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }

  return rawValue;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatValue(item)).join(', ')}]`;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  if (value === null) {
    return 'null';
  }

  const escaped = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${escaped}'`;
}

function unescapeQuoted(value) {
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}
