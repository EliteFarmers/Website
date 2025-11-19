import { STRAPI_API_URL, STRAPI_TOKEN } from '$env/static/private';
import { articleGetArticlesResponse } from '$lib/api/client/EliteCms.zod';
import { mdToHtml, mdToInline } from '$lib/md';
import qs from 'qs';
import * as z from 'zod';

export async function fetchCmsData<T>(endpoint: string): Promise<T | null> {
	if (!STRAPI_TOKEN || !STRAPI_API_URL) {
		return null;
	}

	const res = await fetch(`${STRAPI_API_URL}/api${endpoint}`, {
		headers: {
			Authorization: `Bearer ${STRAPI_TOKEN}`,
		},
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch CMS data from ${endpoint}: ${res.status} ${res.statusText}`);
	}

	return await (res.json() as Promise<T>);
}

export async function fetchArticleBySlug(slug: string) {
	const query = qs.stringify(
		{
			filters: { slug: { $eq: slug } },
			populate: {
				cover: {
					fields: ['url', 'alternativeText', 'width', 'height'],
				},
				author: {
					fields: ['name'],
					populate: {
						avatar: {
							fields: ['url'],
						},
					},
				},
				categories: {
					fields: ['name', 'slug'],
				},
				tags: {
					fields: ['name', 'slug'],
				},
			},
		},
		{
			encodeValuesOnly: true,
		}
	);

	const data = await fetchCmsData<z.infer<typeof articleGetArticlesResponse>>(`/articles?${query}`);

	if (data?.data.length === 0) {
		return null;
	}

	return data?.data[0];
}

const formatSchema = z.object({
	url: z.string(),
	name: z.string(),
	path: z.string().nullable(),
	size: z.number(),
	width: z.number(),
	height: z.number(),
});

const flatCoverSchema = z
	.object({
		id: z.number(),
		documentId: z.string(),
		url: z.string(),
		alternativeText: z.string().nullable(),
		width: z.number(),
		height: z.number(),
		formats: z.record(z.string(), formatSchema).optional().nullable(),
		hash: z.string().optional(),
		ext: z.string().optional(),
		mime: z.string().optional(),
		size: z.number().optional(),
		previewUrl: z.string().nullable().optional(),
	})
	.nullable();

export type StrapiCover = z.infer<typeof flatCoverSchema>;

const flatAuthorSchema = z
	.object({
		id: z.number(),
		documentId: z.string(),
		name: z.string(),
		avatar: z
			.object({
				url: z.string(),
			})
			.nullable(),
	})
	.nullable();

const flatTaxonomyItemSchema = z.object({
	id: z.number(),
	documentId: z.string(),
	name: z.string(),
	slug: z.string(),
});

export const articleItemSchema = z.object({
	id: z.number(),
	documentId: z.string(),
	title: z.string().nullable(),
	releasedAt: z.string().nullable(),
	summary: z.string().nullable(),
	slug: z.string().nullable(),
	lastUpdated: z.string().nullable(),

	cover: flatCoverSchema,
	author: flatAuthorSchema,
	categories: z.array(flatTaxonomyItemSchema),
	tags: z.array(flatTaxonomyItemSchema),
});

export type ArticleItemType = z.infer<typeof articleItemSchema>;

const paginatedArticlesResponseSchema = z.object({
	data: z.array(articleItemSchema),
	meta: z.object({
		pagination: z.object({
			page: z.number(),
			pageSize: z.number(),
			pageCount: z.number(),
			total: z.number(),
		}),
	}),
});

/**
 * Fetch a paginated list of articles. Sorted by published date newest.
 * Only returns some fields for each article.
 * @param page Page number
 * @param pageSize Max results per page
 * @returns
 */
export async function fetchArticlesPaginated(page: number, pageSize: number, ascending = false, category?: string) {
	const query = qs.stringify(
		{
			pagination: {
				page: page,
				pageSize: pageSize,
			},
			sort: ['releasedAt:' + (ascending ? 'asc' : 'desc')],
			filters: category ? { categories: { slug: { $eq: category } } } : undefined,
			fields: ['title', 'releasedAt', 'summary', 'slug', 'lastUpdated'],
			populate: {
				cover: true,
				author: {
					fields: ['name'],
					populate: {
						avatar: {
							fields: ['url'],
						},
					},
				},
				categories: {
					fields: ['name', 'slug'],
				},
				tags: {
					fields: ['name', 'slug'],
				},
			},
		},
		{
			encodeValuesOnly: true,
		}
	);

	const data = await fetchCmsData<unknown>(`/articles?${query}`);

	if (!data) {
		return null;
	}

	const parsed = paginatedArticlesResponseSchema.safeParse(data);
	if (!parsed.success) {
		console.error('Failed to parse paginated articles:', parsed.error);
		throw new Error('Failed to parse paginated articles');
	}

	return parsed.data;
}

export async function fetchBusinessInfo() {
	try {
		const response = await fetchCmsData<{ data: { name: string; contact: string; footer: string } }>(
			`/business-info`
		);

		if (!response || !response.data) {
			return { name: 'Placeholder Name', contact: 'Placeholder Contact', footer: 'Placeholder Footer' };
		}

		const result = {
			name: await mdToInline(response.data.name),
			contact: await mdToHtml(response.data.contact),
			footer: await mdToInline(response.data.footer),
		};

		return result;
	} catch (error) {
		if (STRAPI_TOKEN) {
			console.error('Error fetching business info:', error);
		}
		return { name: 'Placeholder Name', contact: 'Placeholder Contact', footer: 'Placeholder Footer' };
	}
}

export async function fetchAllArticleCategories() {
	const query = qs.stringify(
		{
			sort: ['name:asc'],
			fields: ['name', 'slug'],
			// Check that only categories with at least one article are returned
			filters: { articles: { id: { $notNull: true } } },
			populate: {
				articles: { fields: ['id'] },
			},
		},
		{
			encodeValuesOnly: true,
		}
	);

	const data = await fetchCmsData<{ data: unknown }>(`/categories?${query}`);

	if (!data?.data) {
		return null;
	}

	const parsed = z.array(flatTaxonomyItemSchema).safeParse(data.data);
	if (!parsed.success) {
		console.error('Failed to parse article categories:', parsed.error);
		throw new Error('Failed to parse article categories');
	}

	return parsed.data;
}
