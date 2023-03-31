<script lang="ts">
	import { page } from "$app/stores";
	import { getLevelProgress, GetPetLevel, InsertColorCodes, RemoveColorCodes } from "$lib/format";
	import { onMount } from "svelte";

	import Paper from "@smui/paper";
	import Skillbar from "$comp/stats/skillbar.svelte";	
	import Slot from './slot.svelte';

	import type { PageData } from "./$types";
	import type { ItemStack, PetData } from "$lib/skyblock";
	import Apistatus from "$comp/stats/apistatus.svelte";
	import { RARITY_COLORS_CODES } from "$lib/constants/colors";
	export let data: PageData;

	const { id: uuid, name: ign } = data.account;
	let profileName = data.cute_name;

	onMount(async () => {
		const url = `/rates/${ign}/${profileName}`;
		if ($page.url.pathname !== url) {
			history.replaceState(history.state, document.title, url + ($page.url.hash ?? ''));
		}
	});

	const farmingProgress = getLevelProgress('combat', data.member?.skills?.farming ?? 0);

	const armor = data.member?.inventories.armor ?? [];

	function extractArmorFortune(item: ItemStack | null) {
		if (!item) return 0;

		if (item?.tag?.ExtraAttributes?.id === 'ENCHANTED_JACK_O_LANTERN') {
			return farmingProgress.level;
		}

		const lore: string[] = item?.tag?.display.Lore ?? [];
		const fortune = lore.find(line => line.includes('Farming Fortune'))?.split('+')[1];
		const numFortune = Number(fortune);

		if (!fortune || isNaN(numFortune)) return 0;

		return numFortune;
	}

	const helmet = [ InsertColorCodes(armor[3]?.tag?.display?.Name) || 'No Helmet', extractArmorFortune(armor[3])];
	const chestplate = [ InsertColorCodes(armor[2]?.tag?.display?.Name) || 'No Chestplate', extractArmorFortune(armor[2])];
	const leggings = [ InsertColorCodes(armor[1]?.tag?.display?.Name) || 'No Leggings', extractArmorFortune(armor[1])];
	const boots = [ InsertColorCodes(armor[0]?.tag?.display?.Name) || 'No Boots', extractArmorFortune(armor[0])];

	const armorBonuses = new Map<string, number>();
	for (const item of armor) {
		const lore = item?.tag?.display.Lore ?? [];
		const chunks: string[] = lore.join('|').split('||');

		const bonusLine = chunks.find(line => line.includes('Tiered Bonus'));
		const id = bonusLine?.substring(0, bonusLine.indexOf('|'));

		if (!id || armorBonuses.has(id) || !bonusLine) continue;
		
		const bonusAmount = parseInt(RemoveColorCodes(bonusLine)?.match(/\d+☘/g)?.[0].replace('☘', '') ?? '0');
		if (!bonusAmount || isNaN(bonusAmount)) continue;

		armorBonuses.set(id, bonusAmount);
	}

	const armorFortune = +helmet[1] + +chestplate[1] + +leggings[1] + +boots[1] + [...armorBonuses.values()].reduce((a, b) => a + b, 0);

	const elephants: PetData[] = data.member.pets?.filter((pet: PetData) => pet.type === 'ELEPHANT') ?? [];
	const cows: PetData[] = data.member.pets?.filter((pet: PetData) => pet.type === 'MOOSHROOM_COW') ?? [];

	elephants.sort((a, b) => b.exp - a.exp);
	cows.sort((a, b) => b.exp - a.exp);

	const elephantLevel = GetPetLevel(elephants[0]?.exp ?? 0);
	const cowLevel = GetPetLevel(cows[0]?.exp ?? 0);
</script>

<section class="my-16 mx-8 md:mx-16 flex flex-col gap-8">
	<Paper
		class="flex flex-col items-center justify-center w-full gap-2 h-32"
		elevation={6}
	>
		<h1 class="text-3xl">Optimizing <span class="font-semibold">{ign}</span> on <span class="font-semibold">{profileName}</span></h1>
		<p>View what peak farming efficiency looks like!</p>
	</Paper>

	<Apistatus api={data.api} bannerOnly={true} />

	<div class="flex flex-col md:flex-row gap-8">
		<Paper elevation={6}>
			<div class="flex flex-row gap-8 flex-1">
				<div class="flex flex-col flex-1 items gap-2 w-full h-full">
					<Slot item={armor[3]}>Helmet</Slot>
					<Slot item={armor[2]}>Chestplate</Slot>
					<Slot item={armor[1]}>Leggings</Slot>
					<Slot item={armor[0]}>Boots</Slot>
				</div>
				<img class="flex-[1.75] w-full h-fit" src="https://mc-heads.net/body/{uuid}" alt="{ign}'s Minecraft Skin">
			</div>
			<p class="pt-1">Images will eventually be added for armor</p>
		</Paper>
		<Paper class="flex-[4]">
			<table class="w-full">
				<thead>
					<tr>
						<th class="text-left text-xl">Fortune Source</th>
						<th class="text-left text-xl">Fortune Gain / Max</th>
					</tr>
				</thead>
				<tbody class="odd:bg-gray-100 odd:dark:bg-zinc-900">
					<tr>
						<td>
							<h3 class="text-xl font-semibold">Base Fortune</h3>
							Without any buffs, everyone has 100 fortune.
						</td>
						<td class="text-2xl font-semibold">
							100 <span class="text-lg font-thin">/ 100</span>
						</td>
					</tr>
					<tr>
						<td>
							<Skillbar name="Farming" progress={farmingProgress} fullWidth={true} />
						</td>
						<td class="text-2xl font-semibold">
							{farmingProgress.level * 4}
							<span class="text-lg font-thin">/ 240</span>
						</td>
					</tr>
					<tr>
						<td>
							<h3 class="text-xl font-semibold">Armor</h3>
							<p>{@html helmet[0]} - {helmet[1]}</p>
							<p>{@html chestplate[0]} - {chestplate[1]}</p>
							<p>{@html leggings[0]} - {leggings[1]}</p>
							<p>{@html boots[0]} - {boots[1]}</p>
							{#if armorBonuses.size > 0}
								<p class="text-lg font-semi mt-2">Armor Bonus</p>
								{#each [...armorBonuses.entries()] as [ bonus, amount ] (bonus)}
									<p>{@html InsertColorCodes(bonus)} - {amount}</p>
								{/each}
							{/if}
						</td>
						<td class="text-xl font-semibold">
							{armorFortune}
							<span class="text-lg font-thin">/ 235</span>
						</td>
					</tr>
					<tr>
						<td>
							<h3 class="text-xl font-semibold">Pets</h3>
							{#if elephants.length > 0}
								<p class="py-2">{@html InsertColorCodes(`${RARITY_COLORS_CODES[elephants[0].tier]}[${elephantLevel}] Elephant`)} - {elephantLevel * 1.8}</p>
							{:else}
								<p>No Elephant Found!</p>
							{/if}
							{#if cows.length > 0}
								<p class="pt-2">{@html InsertColorCodes(`${RARITY_COLORS_CODES[cows[0].tier]}[${cowLevel}] Mooshroom Cow`)} - {((10 + cowLevel) * (cows[0].heldItem === 'MINOS_RELIC' ? 1.3333 : 1)).toFixed(2)}</p>
								{#if cows[0].heldItem === 'MINOS_RELIC'}
									<p>With Minos Relic</p>
								{/if}
							{:else}
								<p>No Mooshroom Cow Found!</p>
							{/if}
						</td>
						<td class="text-xl font-semibold">
							{(data.member.jacob?.perks?.double_drops ?? 0) * 2}
							<span class="text-lg font-thin">/ 30</span>
						</td>
					</tr>
					<tr>
						<td>
							<h3 class="text-xl font-semibold">Anita Bonus</h3>
							<p>+{(data.member.jacob?.perks?.double_drops ?? 0) * 2} Farming Fortune</p>
						</td>
						<td class="text-xl font-semibold">
							{(data.member.jacob?.perks?.double_drops ?? 0) * 2}
							<span class="text-lg font-thin">/ 30</span>
						</td>
					</tr>
				</tbody>
			</table>
		</Paper>
	</div>
</section>

<style lang="postcss">
	td,
	th {
		@apply px-2 py-4;
	}
</style>