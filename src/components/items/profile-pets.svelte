<script lang="ts">
	import ProfilePetCard from '$comp/items/profile-pet-card.svelte';
	import { getItems } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { ScrollArea } from '$ui/scroll-area';

	const ctx = getStatsContext();

	const sortedPets = $derived.by(() => {
		const pets = ctx.member.current?.pets ?? [];

		return pets.toSorted((a, b) => {
			const rarityDiff = comparePetRarity(a.tier ?? 'COMMON', b.tier ?? 'COMMON');
			if (rarityDiff !== 0) return rarityDiff;
			if (a.active !== b.active) return a.active ? -1 : 1;
			if (a.level !== b.level) return b.level - a.level;
			return formatPetName(a.type).localeCompare(formatPetName(b.type));
		});
	});

	const heldItemIds = $derived(
		Array.from(
			new Set(
				sortedPets
					.map((pet) => pet.heldItem)
					.filter((heldItem): heldItem is string => typeof heldItem === 'string' && heldItem.length > 0)
			)
		)
	);

	const heldItems = $derived(heldItemIds.length > 0 ? getItems(heldItemIds) : undefined);

	const groupedPets = $derived.by(() => {
		const groups: Partial<Record<string, Array<(typeof sortedPets)[number]>>> = {};

		for (const pet of sortedPets) {
			const tier = pet.tier ?? 'COMMON';
			groups[tier] ??= [];
			groups[tier]?.push(pet);
		}

		return Object.entries(groups).sort(([a], [b]) => comparePetRarity(a, b));
	});

	function formatPetName(type: string) {
		return type
			.toLowerCase()
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function formatHeldItem(itemId: string) {
		return itemId
			.toLowerCase()
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function getHeldItemName(itemId: string | null) {
		if (!itemId) return 'None';

		const item = heldItems?.current?.[itemId];
		return item?.item?.name ?? item?.bazaar?.name ?? formatHeldItem(itemId);
	}

	function comparePetRarity(a: string, b: string) {
		return getTierRank(b) - getTierRank(a);
	}

	function getTierRank(tier: string) {
		switch (tier) {
			case 'MYTHIC':
				return 6;
			case 'LEGENDARY':
				return 5;
			case 'EPIC':
				return 4;
			case 'RARE':
				return 3;
			case 'UNCOMMON':
				return 2;
			default:
				return 1;
		}
	}
</script>

<section id="pets" class="my-16 flex w-full justify-center px-2">
	<div class="flex w-full max-w-7xl flex-col items-center gap-1">
		<div class="flex w-full max-w-4xl flex-1 flex-col gap-1">
			<h3 class="mt-2 mb-4 text-xl leading-none font-semibold">Pets</h3>

			{#if groupedPets.length === 0}
				<div
					class="bg-card flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed px-6 text-center"
				>
					<p class="text-muted-foreground mt-1 max-w-md text-sm">No pets found</p>
				</div>
			{:else}
				<ScrollArea class="flex max-h-120 min-h-0 w-full flex-col rounded-md border p-3">
					<div class="flex flex-col gap-5 pr-2">
						{#each groupedPets as [rarity, pets] (rarity)}
							<div class="flex flex-col gap-2">
								<p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
									{rarity}
								</p>
								<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
									{#each pets as pet (pet.uuid ?? pet)}
										<ProfilePetCard
											{pet}
											petName={formatPetName(pet.type)}
											tier={pet.tier ?? 'COMMON'}
											heldItemName={getHeldItemName(pet.heldItem ?? null)}
										/>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</ScrollArea>
			{/if}
		</div>
	</div>
</section>
