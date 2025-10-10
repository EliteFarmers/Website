<script lang="ts">
	import Head from '$comp/head.svelte';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import Button from '$ui/button/button.svelte';
	import type { PageProps } from './$types';
	import GemPackage from './gem-package.svelte';
	import { SKYBLOCK_GEM_PACKAGES, STORE_CODE } from './hypixel-store';

	let { data }: PageProps = $props();

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Gems',
			href: '/gems',
		},
	]);

	const firesales = $derived(data.gems.firesales);
	const taylorsCollection = $derived(data.gems.taylorCollection);
	const seasonalBundle = $derived(data.gems.seasonalBundles);

	const breadcrumb = getPageCtx();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});
</script>

<Head
	title="SkyBlock Gems & Firesales"
	description="Use creator code {STORE_CODE.code} for 5% off the Hypixel Store! Creator codes are the only way to get discounts on SkyBlock Gems!"
/>

<div class="my-4 flex w-full flex-col items-center">
	<div
		class="bg-card relative flex h-20 w-full max-w-7xl items-center justify-center overflow-hidden rounded-md border-2"
	>
		<div class="flex-1/5"></div>
		<div class="flex flex-3/5 items-center justify-center">
			<p class="text-lg">
				Use code <strong class="font-mono">{STORE_CODE.code}</strong> for 5% off the Hypixel Store!*
			</p>
		</div>
		<div class="flex flex-1/5 items-center justify-end gap-2 pr-5">
			<Button href={STORE_CODE.youtube} target="_blank" class="">YouTube</Button>
		</div>
		<div class="absolute top-1 left-5">
			<img src="https://mc-heads.net/body/{STORE_CODE.uuid}" class="w-16" alt="" />
		</div>
	</div>
	<h1 class="my-12 text-4xl font-semibold">SkyBlock Gems</h1>
	<div class="flex flex-wrap justify-center gap-4">
		{#each SKYBLOCK_GEM_PACKAGES as gemPackage (gemPackage.url)}
			<GemPackage {gemPackage} />
		{/each}
	</div>
	<h2 class="my-12 text-4xl font-semibold">Firesales</h2>
	<div class="flex flex-wrap justify-center gap-4">
		{#if firesales.length === 0}
			<p class="text-muted-foreground">No firesales available at the moment.</p>
		{:else}
			{#each firesales as sale (sale.startsAt)}
				{#each sale.items as item (item.itemId)}
					<div>
						<span>{item.itemId}</span> - <span>{item.price} Gems</span>
					</div>
				{/each}
			{/each}
		{/if}
	</div>

	<div>
		<p class="text-muted-foreground mt-12 max-w-3xl text-center text-sm">
			*Creator codes are the only way to get discounts on SkyBlock Gems. By using a creator code, you are
			supporting the creator and allowing them to continue making content. Thank you for your support!
		</p>
		<p class="text-muted-foreground mt-4 max-w-3xl text-center text-sm">
			This website is not affiliated with Hypixel, their gem listings here are shown for your convenience only.
			All purchases are made through the official Hypixel Store.
		</p>
	</div>
</div>
