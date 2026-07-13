<script lang="ts">
	import ShopShell from '$comp/shop/shop-shell.svelte';
	import { initTebex } from '$lib/tebex/index.svelte';
	import { Toaster } from '$ui/sonner';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	const tebexCtx = initTebex();

	let { data, children }: LayoutProps = $props();

	onMount(async () => {
		const tebex = await import('@tebexio/tebex.js');
		window.Tebex = tebex;
		tebexCtx.init(tebex);
	});
</script>

<ShopShell categories={data.categories} storefront={data.storefront} footerHtml={data.cache?.footer}>
	{@render children()}
</ShopShell>

<Toaster />
