import { query } from '$app/server';
import { fetchArticleBySlug, fetchArticlesPaginated } from '$lib/api/cms';
import * as z from 'zod';

export const getArticle = query(z.string(), async (slug: string) => {
	return await fetchArticleBySlug(slug);
});

export const getArticlesPaginated = query(
	z.object({
		page: z.number().min(1).default(1),
		pageSize: z.number().min(1).max(100).default(30),
		ascending: z.boolean().default(false),
		category: z.string().optional(),
	}),
	async ({ page, pageSize, ascending, category }) => {
		return await fetchArticlesPaginated(page, pageSize, ascending, category);
	}
);
