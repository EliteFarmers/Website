<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Popover from '$ui/popover';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { FarmingPets, type FarmingPet } from 'farming-weight';

	interface Props {
		player: RatesPlayerStore;
		selected?: FarmingPet | undefined;
		onChange?: (uuid: string) => void;
	}

	let { selected = $bindable(undefined), player, onChange = undefined }: Props = $props();

	let show = $state(2);

	selected = $player.selectedPet;

	function toggleShow() {
		show = show === 2 ? 999 : 2;
	}

	let grouped = $state(
		$player.pets.reduce<Record<string, FarmingPet[]>>((acc, pet) => {
			acc[pet.type] ??= [];
			acc[pet.type].push(pet);
			acc[pet.type].sort((a, b) => b.fortune - a.fortune);
			return acc;
		}, {})
	);

	let activeId = $state({
		[FarmingPets.RoseDragon]: grouped[FarmingPets.RoseDragon]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.MooshroomCow]: grouped[FarmingPets.MooshroomCow]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Elephant]: grouped[FarmingPets.Elephant]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Mosquito]: grouped[FarmingPets.Mosquito]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Rabbit]: grouped[FarmingPets.Rabbit]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Slug]: grouped[FarmingPets.Slug]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Hedgehog]: grouped[FarmingPets.Hedgehog]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Bee]: grouped[FarmingPets.Bee]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Chicken]: grouped[FarmingPets.Chicken]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Pig]: grouped[FarmingPets.Pig]?.at(0)?.pet.uuid ?? undefined,
	} as Record<string, string | undefined>);

	const groups = $derived(
		Object.entries(activeId)
			.filter(([, v]) => v)
			.slice(0, show)
	);

	function onSelectedChange(type: string, pet: FarmingPet) {
		const petId = pet.pet.uuid ?? '';
		activeId = { ...activeId, [type]: petId };
		onChange?.(petId);

		$player.selectPet(pet);
		player.refresh();

		selected = pet;
	}
</script>

<div class="flex min-w-full flex-col gap-4 rounded-md border p-3">
	<div class="flex w-full items-center justify-between px-1 pt-2">
		<p class="text-lg font-semibold">Farming Pet</p>
		{#if $player.selectedPet}
			<FortuneBreakdown breakdown={$player.selectedPet.breakdown} />
		{:else}
			<FortuneBreakdown total={0} />
		{/if}
	</div>
	<hr />
	<div class="grid w-full flex-col gap-2">
		{#each groups as [type, petId] (petId)}
			{@const pet = grouped[type].find((p) => p.pet.uuid === petId)}
			{#if pet}
				{@const selected = $player.selectedPet?.pet.uuid === pet.pet.uuid}
				{@const best = pet.fortune >= grouped[type][0]?.fortune}
				<div
					class="{selected
						? 'border-muted'
						: 'border-transparent'} has-[.selectable:hover]:bg-muted/30 flex w-full cursor-pointer items-center justify-between rounded-lg border-[3px] border-solid px-1"
				>
					<div class="flex h-full flex-1 flex-row items-center">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
								<ArrowLeftRight size={20} />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="max-w-xl">
								<DropdownMenu.Label>Swap {pet.info.name} Pet</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.RadioGroup
									bind:value={activeId[type]}
									onValueChange={(value) => {
										const newPet = grouped[type].find((p) => p.pet.uuid === value);
										if (newPet) {
											onSelectedChange(type, newPet);
										}
									}}
								>
									{#each grouped[type] as petOption (petOption.pet.uuid)}
										{#if petOption.pet.uuid}
											<DropdownMenu.RadioItem value={petOption.pet.uuid}>
												<div class="flex flex-row items-center gap-1">
													<FormattedText text={petOption.getFormattedName()} />
													<FortuneBreakdown total={petOption.fortune} small={true} />
												</div>
											</DropdownMenu.RadioItem>
										{/if}
									{/each}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						<button
							class="selectable flex h-10 flex-1 items-center text-left"
							onclick={() => onSelectedChange(type, pet)}
						>
							<ItemRender skyblockId={pet.pet.type ?? ''} pet class="size-10" />

							<span class="text-lg font-semibold"><FormattedText text={pet.getFormattedName()} /></span>
						</button>
					</div>
					<div class="flex h-full flex-row items-center gap-2">
						{#if !best}
							<Popover.Mobile>
								{#snippet trigger()}
									<div class="px-1">
										<TriangleAlert size={20} class="text-completed -mb-1" />
									</div>
								{/snippet}
								<div class="max-w-xs">
									<p class="text-md">This isn't the highest fortune pet!</p>
								</div>
							</Popover.Mobile>
						{/if}
						{#key $player}
							<FortuneBreakdown breakdown={pet.breakdown} />
						{/key}
					</div>
				</div>
			{/if}
		{/each}
		{#if Object.values(activeId).filter((v) => v).length > 2}
			<button
				onclick={toggleShow}
				class="hover:bg-card/50 flex w-fit cursor-pointer items-center justify-center rounded-lg border-[3px] border-solid border-transparent px-1 py-0.5 text-sm"
			>
				{show === 2 ? 'Show More' : 'Show Less'}
			</button>
		{/if}

		{#if !Object.values(activeId).some((pet) => pet)}
			<p class="my-4 text-center text-lg font-semibold">No matching pets found!</p>
		{/if}
	</div>
</div>
