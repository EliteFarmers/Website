<script lang="ts">
	import type { ShopCategoryDto } from '$lib/api';
	import type { ShopStorefrontResponse } from '$lib/shop/storefront';
	import type { Snippet } from 'svelte';
	import ShopFooter from './shop-footer.svelte';
	import ShopHeader from './shop-header.svelte';

	interface Props {
		categories: ShopCategoryDto[];
		storefront: ShopStorefrontResponse;
		footerHtml?: string;
		children?: Snippet;
	}

	let { categories, storefront, footerHtml = '', children }: Props = $props();
</script>

<div class="bg-background text-foreground relative min-h-screen overflow-x-clip">
	<div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
		<div class="bg-primary/10 absolute -top-48 -left-32 h-112 w-md rounded-full blur-3xl"></div>
		<div class="bg-progress/10 absolute top-56 -right-32 h-96 w-[24rem] rounded-full blur-3xl"></div>
		<div class="bg-wildrose/10 absolute right-[18%] bottom-40 h-80 w-[20rem] rounded-full blur-3xl"></div>
	</div>

	<ShopHeader {categories} />

	<main class="relative z-10">
		{@render children?.()}
	</main>

	<ShopFooter {storefront} {footerHtml} />
</div>
