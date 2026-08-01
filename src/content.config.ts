import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	// Load Markdown and MDX files in the `src/content/posts/` directory.
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			excerpt: z.string().optional(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			category: z.string().optional(),
			tags: z.array(z.string()).default([]),
			author: z.string().optional(),
			draft: z.boolean().default(false),
		}),
});

const pages = defineCollection({
	// Static pages (e.g. /about) live in `src/content/pages/`.
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { posts, pages };
