<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import Head from '$comp/head.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import { getItemValue } from '$lib/remote/items.remote';
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
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
	const currentSeason = $derived(
		seasonalBundle?.items.map((b) => +b.released.split(' ')[1]).sort((a, b) => b - a)[0]
	);
	const seasonalBundleCurrent = $derived(
		seasonalBundle?.items.filter((b) => b.released.endsWith(currentSeason.toString()))
	);

	const breadcrumb = getPageCtx();

	const cookieValue = getItemValue('BOOSTER_COOKIE');
	const cookieCoinValue = $derived(cookieValue.current?.lowest ?? 0);

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});

	const gbl = getGlobalContext();

	let selectedPackage = $state<(typeof SKYBLOCK_GEM_PACKAGES)[number] | null>(null);
	let dialogOpen = $state(false);
	const packageUrl = $derived(
		gbl.session?.ign ? selectedPackage?.url + '?ign=' + gbl.session?.ign : selectedPackage?.url
	);
</script>

<Head
	title="SkyBlock Gems & Firesales"
	description="Use creator code {STORE_CODE.code} for 5% off the Hypixel Store! Creator codes are the only way to get discounts on SkyBlock Gems!"
/>

<div class="my-4 flex w-full flex-col items-center">
	<div
		class="bg-card relative flex h-20 w-full max-w-7xl items-center justify-center gap-1 overflow-hidden rounded-md border-2"
	>
		<div class="flex-1/5"></div>
		<div class="flex flex-3/5 items-center justify-center">
			<p class="text-sm sm:text-base md:text-lg">
				Use code <strong class="font-mono">{STORE_CODE.code}</strong> for <strong>5%</strong> off the Hypixel
				Store!<a href="#creator-code-note" class="hover:underline">*</a>
			</p>
		</div>
		<div class="flex flex-1/5 items-center justify-end gap-2 pr-2 sm:pr-5">
			<Button href={STORE_CODE.youtube} target="_blank" class="">YouTube</Button>
		</div>
		<div class="absolute top-1 left-1 sm:left-5">
			<img src="https://mc-heads.net/body/{STORE_CODE.uuid}" class="mt-4 h-30 sm:mt-0 sm:h-40" alt="" />
		</div>
	</div>

	<h1 class="my-16 text-4xl font-semibold">SkyBlock Gems</h1>
	<div class="flex flex-col justify-center gap-4 md:flex-row md:flex-wrap">
		{#each SKYBLOCK_GEM_PACKAGES as gemPackage (gemPackage.url)}
			<GemPackage {gemPackage} cookieValue={cookieCoinValue}>
				{#snippet button()}
					<Button
						onclick={() => {
							selectedPackage = gemPackage;
							dialogOpen = true;
						}}><ShoppingCart /> Buy Now</Button
					>
				{/snippet}
			</GemPackage>
		{/each}
	</div>

	<h2 class="my-12 text-4xl font-semibold">Booster Cookies</h2>
	<div class="flex flex-wrap justify-center gap-4">
		<div class="flex basis-64 flex-row items-center gap-2 rounded-md border-2 p-2">
			<ItemRender skyblockId="BOOSTER_COOKIE" class="size-16" />
			<div class="flex w-full flex-col justify-center">
				<p class="font-semibold">Booster Cookie</p>
				<p class="">{(325).toLocaleString()} Gems</p>
				{#await cookieValue then value}
					{@const coins = value.lowest}
					{#if coins == 0}
						<p class="text-muted-foreground text-sm">No market data</p>
					{:else}
						<p class="text-completed text-sm">{coins.toLocaleString()} Coins</p>
						<p class="text-completed text-sm">
							{Math.round(coins / 325).toLocaleString()} Coins/Gem
						</p>
					{/if}
				{/await}
			</div>
		</div>
	</div>

	<h2 class="my-12 text-4xl font-semibold">Firesales</h2>
	<div class="flex flex-wrap justify-center gap-4">
		{#if !firesales?.length}
			<p class="text-muted-foreground mb-8">There are no firesales at the moment!</p>
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

	<h2 class="my-12 text-4xl font-semibold">Seasonal Bundle</h2>
	<div class="flex flex-wrap justify-center gap-4">
		{#if !seasonalBundle?.items.length}
			<p class="text-muted-foreground">Seasonal Bundle is not available at the moment!</p>
		{:else}
			{#each seasonalBundleCurrent as item (item.name)}
				{@const outputItem = item.output[0]}
				{#if outputItem?.item_id}
					<div class="flex basis-64 flex-row items-center gap-2 rounded-md border-2 p-2">
						<ItemRender skyblockId={outputItem.item_id} class="size-16" />
						<div class="flex w-full flex-col justify-center">
							<p class="font-semibold">{item.name}</p>
							<p class="">{item.cost[0].amount.toLocaleString()} Gems</p>
							{#await getItemValue(outputItem.item_id) then value}
								{@const coins = value.lowest}
								{#if coins == 0}
									<p class="text-muted-foreground text-sm">No market data</p>
								{:else}
									<p class="text-completed text-sm">{coins.toLocaleString()} Coins</p>
									<p class="text-completed text-sm">
										{Math.round(coins / item.cost[0].amount).toLocaleString()} Coins/Gem
									</p>
								{/if}
							{/await}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<h2 class="my-12 text-4xl font-semibold">Taylor's Collection</h2>
	<div class="flex flex-wrap justify-center gap-4">
		{#if !taylorsCollection?.items.length}
			<p class="text-muted-foreground">Taylor's Collection is not available at the moment!</p>
		{:else}
			{#each taylorsCollection.items as item (item.name)}
				{@const outputItem = item.output[0]}
				{#if outputItem?.item_id}
					<div class="flex basis-64 flex-row items-center gap-2 rounded-md border-2 p-2">
						<ItemRender skyblockId={outputItem.item_id} class="size-16" />
						<div class="flex w-full flex-col justify-center">
							<p class="font-semibold">{item.name}</p>
							<p class="">{item.cost[0].amount.toLocaleString()} Gems</p>
							{#await getItemValue(outputItem.item_id) then value}
								{@const coins = value.lowest}
								{#if coins == 0}
									<p class="text-muted-foreground text-sm">No market data</p>
								{:else}
									<p class="text-completed text-sm">{coins.toLocaleString()} Coins</p>
									<p class="text-completed text-sm">
										{Math.round(coins / item.cost[0].amount).toLocaleString()} Coins/Gem
									</p>
								{/if}
							{/await}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<div>
		<p class="text-muted-foreground mt-12 max-w-3xl text-center text-sm" id="creator-code-note">
			*Creator codes are the only way to get discounts on SkyBlock Gems. By using creator code <strong
				>{STORE_CODE.code}</strong
			>, you get 5% off your Hypixel Store purchase, support the creator, and allow them to continue making
			content. Thank you for your support!
		</p>
		<p class="text-muted-foreground mt-4 max-w-3xl text-center text-sm">
			This website is not affiliated with Hypixel, their gem listings here are shown for your convenience only.
			All purchases are made through the official Hypixel Store.
		</p>
	</div>
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.ScrollContent>
		<Dialog.Header class="mb-4 flex flex-col items-center justify-center gap-2 text-2xl"
			>Use the Creator Code!</Dialog.Header
		>

		<div class="flex flex-col items-center">
			<div class="bg-card flex w-full max-w-80 flex-col items-center gap-1 rounded-md border px-1 py-1">
				<div
					style="background-image: url('/images/creatorcode.webp');"
					class="@container relative aspect-[3/1] w-full max-w-80 rounded-sm bg-cover bg-no-repeat"
				>
					<div class="absolute top-2/5 left-1/3 text-[6cqw] font-semibold text-[#1ec64c]">
						{STORE_CODE.code}
					</div>
				</div>
				<span class="text-xs">You should see this when successful!</span>
			</div>

			<p class="mx-4 my-4 text-center text-sm">
				By using the creator code <strong class="font-mono">{STORE_CODE.code}</strong>, you get 5% off your
				Hypixel Store purchase, support the creator, and allow them to continue making content. Thank you for
				your support!
			</p>
		</div>

		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<CopyToClipboard class="my-4 flex items-center gap-2" text={STORE_CODE.code} variant="outline">
				Copy Creator Code
			</CopyToClipboard>
			<Button href={packageUrl} target="_blank" class="my-4 flex items-center gap-2">
				<ShoppingCart /> Open Hypixel Store
			</Button>
		</div>
	</Dialog.ScrollContent>
</Dialog.Root>
