<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import type { PetDto } from '$lib/api/schemas/PetDto';
	import { getItems } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Item from '$ui/item';
	import * as Popover from '$ui/popover';
	import { ScrollArea } from '$ui/scroll-area';
	import { type FarmingPetType } from 'farming-weight';

	const ctx = getStatsContext();

	function normalizePet(pet: PetDto & FarmingPetType, index: number) {
		return {
			key: pet.uuid ?? `${pet.type}-${pet.exp}-${index}`,
			type: pet.type,
			name: formatPetName(pet.type),
			tier: pet.tier ?? 'COMMON',
			level: pet.level,
			exp: pet.exp,
			active: pet.active,
			heldItem: pet.heldItem ?? null,
			candyUsed: pet.candyUsed,
			skin: pet.skin ?? null,
		};
	}

	const sortedPets = $derived.by(() => {
		const pets = [...(ctx.member.current?.pets ?? [])];

		return pets
			.map((pet, index) => normalizePet(pet, index))
			.sort((a, b) => {
				const rarityDiff = comparePetRarity(a.tier, b.tier);
				if (rarityDiff !== 0) return rarityDiff;
				if (a.active !== b.active) return a.active ? -1 : 1;
				if (a.level !== b.level) return b.level - a.level;
				return a.name.localeCompare(b.name);
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
			groups[pet.tier] ??= [];
			groups[pet.tier]?.push(pet);
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
					<h4 class="text-lg font-semibold">No pets found</h4>
					<p class="text-muted-foreground mt-1 max-w-md text-sm">
						This profile does not currently expose any pets in the API response.
					</p>
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
									{#each pets as pet (pet.key)}
										<Popover.Mobile class="max-w-sm p-3">
											{#snippet child({ props })}
												<Item.Root
													{...props}
													variant="outline"
													role="button"
													tabindex={0}
													class={`relative flex cursor-pointer flex-row items-center transition-colors hover:bg-zinc-500/5 ${pet.active ? 'border-completed' : ''}`}
												>
													<ItemRender skyblockId={pet.type} pet class="pixelated size-12" />
													<Item.Content>
														<Item.Title class="flex items-center gap-2 font-semibold">
															<span>{pet.name}</span>
															{#if pet.active}
																<span
																	class="text-completed text-xs font-semibold uppercase"
																	>Active</span
																>
															{/if}
														</Item.Title>
														<Item.Description>
															Level {pet.level}
															{#if pet.heldItem}
																• {getHeldItemName(pet.heldItem)}
															{/if}
														</Item.Description>
													</Item.Content>
												</Item.Root>
											{/snippet}

											<div class="flex flex-col gap-3">
												<div class="flex items-center gap-3">
													<ItemRender skyblockId={pet.type} pet class="pixelated size-14" />
													<div class="min-w-0">
														<div class="flex flex-wrap items-center gap-2">
															<p class="font-semibold">{pet.name}</p>
															{#if pet.active}
																<span
																	class="text-completed text-xs font-semibold uppercase"
																	>Active Pet</span
																>
															{/if}
														</div>
														<p class="text-muted-foreground text-sm">
															{pet.tier} • Level {pet.level}
														</p>
													</div>
												</div>
												<div class="text-muted-foreground flex flex-col gap-1 text-sm">
													<p>
														Held Item: <span class="text-foreground font-medium"
															>{getHeldItemName(pet.heldItem)}</span
														>
													</p>
													{#if pet.candyUsed > 0}
														<p>
															Candy Used: <span class="text-foreground font-medium"
																>{pet.candyUsed}</span
															>
														</p>
													{/if}
													<p>
														Experience: <span class="text-foreground font-medium"
															>{pet.exp.toLocaleString(undefined, {
																maximumFractionDigits: 0,
															})}</span
														>
													</p>
													{#if pet.skin}
														<p>
															Skin: <span class="text-foreground font-medium"
																>{pet.skin}</span
															>
														</p>
													{/if}
												</div>
											</div>
										</Popover.Mobile>
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
