// @ts-check
import { defineCollection, defineConfig, s } from 'velite';

const postSchema = s
	.object({
		title: s.string(),
		description: s.string(),
		path: s.path(),
		category: s.string(),
		order: s.number().optional(),
		tags: s.array(s.string()).default([]),
		author: s.string().default(''),
		date: s.string().default(''),
		navLabel: s.string().optional(),
		published: s.boolean().default(false),
		component: s.boolean().default(false),
		toc: s.toc(),
	})
	.transform((data) => {
		return {
			...data,
			slug: data.path.split('/').slice(1).join('/'),
			slugFull: `/${data.path}`,
		};
	});

const pageSchema = s.object({
	title: s.string(),
	description: s.string(),
	path: s.path(),
	lastUpdated: s.isodate().optional(),
});

const posts = defineCollection({
	name: 'Post',
	pattern: './posts/**/*.md',
	schema: postSchema,
});

const pages = defineCollection({
	name: 'Page',
	pattern: './routes/**/*.md',
	schema: pageSchema,
});

export default defineConfig({
	root: './src',
	collections: {
		posts,
		pages,
	},
});
