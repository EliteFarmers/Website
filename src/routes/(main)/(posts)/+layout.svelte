<script lang="ts">
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getPosts } from '$lib/remote/posts.remote';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const posts = getPosts();
	const pageCtx = getPageCtx();

	$effect(() => {
		if (!posts.current) return;

		const main = posts.current.find((post) => post.category === 'info');

		const crumbs: Crumb[] = main
			? main.posts.map((post) => ({
					name: post.title,
					href: post.href,
				}))
			: [];

		posts.current
			.filter((post) => post.category !== 'info')
			.map((post) => ({
				name: post.category,
				href: post.posts.find((p) => p.slug === post.category)?.href,
				dropdown: post.posts
					.filter((p) => p.slug !== post.category)
					.map((p) => ({
						name: p.title,
						href: p.href,
					})),
			}))
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

		pageCtx.setSidebar('Info', crumbs, false);
	});
</script>

{@render children?.()}
