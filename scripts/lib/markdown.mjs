import matter from 'gray-matter';

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
  if (!matter.test(raw)) {
    return { data: {}, body: raw };
  }

  const { data, content } = matter(raw);

  return { data, body: content };
}

export function stringifyMarkdownFile(data, body) {
  const orderedKeys = [
    ...ORDERED_KEYS.filter((key) => key in data && data[key] !== undefined),
    ...Object.keys(data).filter((key) => !ORDERED_KEYS.includes(key) && data[key] !== undefined),
  ];
  const orderedData = Object.fromEntries(orderedKeys.map((key) => [key, data[key]]));
  const normalizedBody = body.replace(/^\s+/, '').trimEnd();

  return matter.stringify(normalizedBody, orderedData, {
    lineWidth: 0,
  });
}
