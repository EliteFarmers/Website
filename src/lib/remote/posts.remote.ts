import { query } from '$app/server';
import type { Crumb } from '$lib/hooks/page.svelte';
import { getPostsSidebar } from '$lib/posts';

export const getResourcesSidebar = query(async () => {
	const posts = await getPostsSidebar();
	const main = posts.find((post) => post.category === 'info');

	const crumbs: Crumb[] = main
		? main.posts.map((post) => ({
				name: post.title,
				href: post.href,
			}))
		: [];

	posts
		.filter((post) => post.category !== 'info')
		.map((post) => ({
			name: post.category,
			href: post.posts.find((p) => p.slug === post.category || p.title === post.category)?.href,
			order: post.posts.find((p) => p.slug === post.category || p.title === post.category)?.order ?? 0,
			dropdown: post.posts
				.filter((p) => p.slug !== post.category && p.title !== post.category)
				.sort((a, b) => a.order - b.order)
				.map((p) => ({
					name: p.title,
					href: p.href,
				})),
		}))
		.sort((a, b) => a.order - b.order)
		.forEach((group) => {
			crumbs.push({
				name: group.name,
				href: group.href,
				dropdown: group.dropdown.map((p) => ({
					name: p.name,
					href: p.href,
				})),
			});
		});

	crumbs.unshift({
		name: 'Info Hub',
		href: '/info',
	});

	return crumbs;
});
