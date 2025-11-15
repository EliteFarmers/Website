<script lang="ts">
	import NitroAdSlot from '$comp/ads/nitro-ad-slot.svelte';
	import Head from '$comp/head.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import type { PageData } from './$types';
	import Category from './category.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const query = new MediaQuery('(min-width: 970px)');
</script>

<Head
	title="Leaderboards"
	description="View the various leaderboards available on the site!"
	keywords="leaderboards, hypixel skyblock, level leaderboard, skills leaderboard, collection leaderboards"
/>

<div class="mb-16 flex flex-col items-center gap-16">
	<h1 class="mt-16 text-center text-4xl">Leaderboards</h1>

	<div class="flex w-full max-w-6xl flex-col items-center justify-center gap-4">
		{#each Object.entries(data.leaderboards ?? {}) as [category, leaderboards], i (category)}
			<Category {leaderboards} title={category} />
			{#if i % 2 == 0 && i !== Object.entries(data.leaderboards ?? {}).length - 1}
				{#if query.current}
					<NitroAdSlot
						class="hidden h-[100px] w-full max-w-svw flex-row items-center justify-center overflow-hidden object-scale-down sm:flex"
						slotId="leaderboard-midpage-{i}"
						config={{
							sizes: [
								['728', '90'],
								['970', '90'],
							],
							report: {
								enabled: true,
								icon: true,
								wording: 'Report Ad',
								position: 'top-right-side',
							},
						}}
					/>
				{:else}
					<NitroAdSlot
						class="flex h-[100px] w-full max-w-svw flex-row items-center justify-center overflow-hidden object-scale-down sm:hidden"
						slotId="leaderboard-midpage-sm-{i}"
						config={{
							sizes: [
								['320', '50'],
								['320', '100'],
							],
							report: {
								enabled: true,
								icon: true,
								wording: 'Report Ad',
								position: 'top-right-side',
							},
						}}
					/>
				{/if}
			{/if}
		{/each}
	</div>
</div>
