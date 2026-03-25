import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    heroImage: image().optional(),
    draft: z.boolean().default(false),
    generatedFrom: z.enum(['zh']).optional(),
    sourceHash: z.string().optional(),
    translationStatus: z.enum(['complete', 'pending']).optional(),
    imageStatus: z.enum(['complete', 'pending']).optional(),
  }),
});

export const collections = { blog };
