import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(), // → standfirst
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      topic: z.enum(['TypeScript', 'Docker', 'Node.js']),
      readingTime: z.string(), // e.g. "9 min"
      heroImage: image().optional(),
      heroCaption: z.string().optional(),
      series: z
        .object({ name: z.string(), part: z.number(), total: z.number() })
        .optional(),
    }),
});

export const collections = { blog };
