<script lang="ts">
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer';
	import { FarmingPets, type FarmingPet } from 'farming-weight';
	import * as Popover from '$ui/popover';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { FormatMinecraftText } from '$lib/format';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import Menu from 'lucide-svelte/icons/menu';
	import { Button, buttonVariants } from '$ui/button';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';

	interface Props {
		pets: FarmingPet[];
		player: RatesPlayerStore;
		onChange: (uuid: string) => void;
	}

	let { pets, player, onChange }: Props = $props();

	let show = $state(2);

	function toggleShow() {
		show = show === 2 ? 999 : 2;
	}

	let grouped = $derived(pets.reduce<Record<string, FarmingPet[]>>((acc, pet) => {
		acc[pet.type] ??= [];
		acc[pet.type].push(pet);
		acc[pet.type].sort((a, b) => b.fortune - a.fortune);
		return acc;
	}, {}));

	let activeId = $derived({
		[FarmingPets.MooshroomCow]: grouped[FarmingPets.MooshroomCow]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Elephant]: grouped[FarmingPets.Elephant]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Bee]: grouped[FarmingPets.Bee]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Rabbit]: grouped[FarmingPets.Rabbit]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.Slug]: grouped[FarmingPets.Slug]?.at(0)?.pet.uuid ?? undefined,
		[FarmingPets.TRex]: grouped[FarmingPets.TRex]?.at(0)?.pet.uuid ?? undefined,
	} as Record<string, string | undefined>);
</script>

<div class="grid flex-col gap-2 w-full mb-2 -mx-2">
	{#each Object.entries(activeId)
		.filter(([, v]) => v)
		.slice(0, show) as [type, petId] (petId ?? type)}
		{@const pet = grouped[type].find((p) => p.pet.uuid === petId)}
		{#if pet}
			{@const selected = $player.selectedPet?.pet.uuid === pet.pet.uuid}
			{@const best = pet.fortune >= grouped[type][0]?.fortune}
			<button
				onclick={() => {
					activeId[type] = pet?.pet.uuid ?? undefined;
					onChange(pet.pet.uuid ?? '');
				}}
				class="{selected
					? 'border-primary-content/20 dark:border-card/70'
					: 'border-transparent'} border-solid border-[3px] hover:bg-primary-content/10 dark:hover:bg-card/50 px-1.5 py-0.5 rounded-lg cursor-pointer flex justify-between items-center w-full"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<span class="text-lg font-semibold">{@html FormatMinecraftText(pet.getFormattedName())}</span>
				<div class="flex flex-row gap-2 items-center">
					{#if !best}
						<Popover.Mobile>
							{#snippet trigger()}
								<div class="px-1">
									<TriangleAlert size={20} class="-mb-1 text-yellow-600 dark:text-yellow-300" />
								</div>
							{/snippet}
							<div class="max-w-xs">
								<p class="text-md">This isn't the highest fortune item!</p>
							</div>
						</Popover.Mobile>
					{/if}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
							<Menu size={20} />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="max-w-xl">
							<DropdownMenu.Label>Swap {pet.info.name} Pet</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.RadioGroup
								bind:value={activeId[type]}
								onValueChange={(value) => {
									const newPet = grouped[type].find((p) => p.pet.uuid === value);
									if (newPet) {
										activeId[type] = newPet.pet.uuid ?? undefined;
										onChange(newPet.pet.uuid ?? '');
									}
								}}
							>
								{#each grouped[type] as petOption (petOption.pet.uuid)}
									{#if petOption.pet.uuid}
										<DropdownMenu.RadioItem value={petOption.pet.uuid}>
											<div class="flex flex-row items-center gap-1">
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html FormatMinecraftText(petOption.getFormattedName())}
												<FortuneBreakdown total={petOption.fortune} small={true} />
											</div>
										</DropdownMenu.RadioItem>
									{/if}
								{/each}
							</DropdownMenu.RadioGroup>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<FortuneBreakdown total={pet.fortune} breakdown={pet.breakdown} />
				</div>
			</button>
		{/if}
	{/each}
	{#if Object.values(activeId).filter((v) => v).length > 2}
		<button
			onclick={toggleShow}
			class="w-fit text-sm border-transparent border-solid border-[3px] hover:bg-card/50 px-1 py-0.5 rounded-lg cursor-pointer flex justify-center items-center"
		>
			{show === 2 ? 'Show More' : 'Show Less'}
		</button>
	{/if}

	{#if !Object.values(activeId).some((pet) => pet)}
		<p class="text-lg font-semibold text-center my-4">No matching pets found!</p>
	{/if}
</div>
