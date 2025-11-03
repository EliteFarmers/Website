import { posts, type Post } from '$posts/index.js';
import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';

export type PostData = {
	metadata: Post;
	title: string;
	component: Component;
};

export type TableOfContentsItem = {
	title: string;
	url: string;
	items?: TableOfContentsItem[];
};

export type TableOfContents = {
	items: TableOfContentsItem[];
};

export type Metadata = {
	title: string;
	description: string;
	openGraph: {
		title: string;
		description: string;
		type: 'article';
		url: string;
		images: [
			{
				url: string;
				width: number;
				height: number;
				alt: string;
			},
		];
	};
	twitter: {
		card: 'summary_large_image';
		title: string;
		description: string;
		images: string[];
		creator: string;
	};
};

export type FrontMatter = {
	title: string;
	description: string;
	component: boolean;
	source: string;
	external?: {
		project: string;
		url: string;
	};
	bits?: string;
};

export type PostFile = {
	default: Component;
	metadata: Metadata;
};

export type PostResolver = () => Promise<PostFile>;

export async function getPost(slug: string): Promise<PostData> {
	const modules = import.meta.glob(`/src/posts/**/*.md`);
	const match = findMatch(slug, modules);
	const post = await match?.resolver?.();

	const metadata = posts.find((post) => post.slug === slug);
	if (!post || !metadata) {
		error(404);
	}

	return {
		component: post.default,
		metadata,
		title: metadata.title,
	};
}

type Modules = Record<string, () => Promise<unknown>>;

function findMatch(slug: string, modules: Modules) {
	let match: { path?: string; resolver?: PostResolver } = {};

	for (const [path, resolver] of Object.entries(modules)) {
		if (slugFromPath(path) === slug) {
			match = { path, resolver: resolver as unknown as PostResolver };
			break;
		}
	}
	if (!match.path) {
		match = getIndexDocIfExists(slug, modules);
	}

	return match;
}

export function slugFromPath(path: string) {
	return path.replace('/src/posts/', '').replace('.md', '');
}

export function slugFromPathname(pathname: string) {
	return pathname.split('/').pop() ?? '';
}

function getIndexDocIfExists(slug: string, modules: Modules) {
	let match: { path?: string; resolver?: PostResolver } = {};

	for (const [path, resolver] of Object.entries(modules)) {
		if (path.includes(`/${slug}/index.md`)) {
			match = { path, resolver: resolver as unknown as PostResolver };
			break;
		}
	}

	return match;
}

export const getAllPostRoutes = async () => {
	const modules = import.meta.glob('/src/posts/**/*.md');
	const entries = [];

	for (const path of Object.keys(modules)) {
		const slug = path.replace('/src/posts/', '').replace('.md', '').replace('/index', '');
		entries.push({ slug });
	}

	return entries;
};

export const getPostsSidebar = async () => {
	const entries = await getAllPostRoutes();
	const navGroups = {} as Record<string, { title: string; href: string; order: number; slug: string }[]>;

	for (const entry of entries) {
		const doc = await getPost(entry.slug);
		navGroups[doc.metadata.category] ??= [];
		navGroups[doc.metadata.category].push({
			title: doc.title,
			href: `/info/${entry.slug}`,
			order: doc.metadata.order ?? 0,
			slug: entry.slug,
		});
	}

	return Object.entries(navGroups).map(([category, posts]) => ({
		category,
		posts: posts.sort((a, b) => {
			b.order ??= 0;
			a.order ??= 0;
			if (a.order !== b.order) {
				return b.order - a.order;
			}
			return a.title.localeCompare(b.title);
		}),
	}));
};
