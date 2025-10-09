<script lang="ts">
	import Head from '$comp/head.svelte';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import GemPackage from './gem-package.svelte';
	import { SKYBLOCK_GEM_PACKAGES } from './hypixel-store';

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Gems',
			href: '/gems',
		},
	]);

	const breadcrumb = getPageCtx();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});
</script>

<Head
	title="SkyBlock Gems & Firesales"
	description="Use creator code SWEET for 5% off the Hypixel Store! Creator codes are the only way to get discounts on SkyBlock Gems!"
/>

<div class="my-4 flex w-full flex-col items-center">
	<div
		class="bg-card relative flex h-20 w-full max-w-7xl items-center justify-center overflow-hidden rounded-md border-2"
	>
		<p class="text-lg">Use code <strong class="font-mono">SWEET</strong> for 5% off!</p>
		<div class="absolute top-1 left-5">
			<img src="https://mc-heads.net/body/13e823891b29408f8b8ea3272001a4e6" class="w-16" alt="" />
		</div>
	</div>
	<h1 class="my-10 text-4xl font-semibold">SkyBlock Gems</h1>
	<div class="flex flex-wrap justify-center gap-4">
		{#each SKYBLOCK_GEM_PACKAGES as gemPackage (gemPackage.url)}
			<GemPackage {gemPackage} />
		{/each}
	</div>
</div>
