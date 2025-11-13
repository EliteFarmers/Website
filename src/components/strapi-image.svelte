<script lang="ts">
	import { PUBLIC_STRAPI_API_URL } from '$env/static/public';
	import type { StrapiCover } from '$lib/api/cms';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLImageElement> {
		cover: StrapiCover;
		alt?: string | null;
		sizes?: string;
		loading?: 'lazy' | 'eager';
	}

	const { cover, alt = '', sizes = '100vw', loading = 'lazy', ...rest }: Props = $props();

	const base = PUBLIC_STRAPI_API_URL ?? '';

	const srcset = $derived.by(() => {
		if (!cover) return null;

		const set: string[] = [];
		const formats = cover.formats ?? null;

		if (formats && typeof formats === 'object') {
			for (const key of Object.keys(formats)) {
				const f = formats[key];
				if (f && f.url && f.width) {
					set.push(`${base}${f.url} ${f.width}w`);
				}
			}
		}

		if (cover && cover.url) {
			if (cover.width) set.push(`${base}${cover.url} ${cover.width}w`);
			else set.push(`${base}${cover.url}`);
		}

		return set.length ? set.join(', ') : null;
	});

	const src = $derived.by(() => {
		if (!cover) return '/images/default-farming-news.png';
		const formats = cover.formats ?? null;
		if (formats && formats.large && formats.large.url) return `${base}${formats.large.url}`;
		if (cover.url) return `${base}${cover.url}`;
		return '/images/default-farming-news.png';
	});
</script>

<img {src} {alt} {loading} decoding="async" {srcset} sizes={srcset ? sizes : undefined} {...rest} />
