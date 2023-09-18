<script lang="ts">
	import type { FarmingTool } from '$lib/calc/fortune';
	import { FormatMinecraftText } from '$lib/format';
	import { Button, Modal, Popover } from 'flowbite-svelte';
	import Lore from '../lore.svelte';
	import { FileLinesSolid } from 'flowbite-svelte-icons';
	import { STAT_ICONS, Stat } from '$lib/constants/reforges';

	export let tool: FarmingTool;

	let openModal = false;
</script>

<div
	class="flex basis-[5rem] w-full max-h-30 flex-row gap-2 justify-between bg-gray-100 dark:bg-zinc-800 rounded-md p-1"
>
	<div class="flex flex-row gap-2 items-center">
		<img
			class="w-14 md:w-20 md:h-20 aspect-square pixelated"
			src={`/packs/hypixelplus/tools/farming/${tool.item.skyblockId?.toLowerCase()}.png`}
			alt="Tool"
		/>
		<div class="flex flex-col items-start">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="font-semibold text-md md:text-lg">{@html FormatMinecraftText(tool.item.name ?? '')}</div>
			<div class="text-md md:text-lg">{tool.farmed.toLocaleString()}</div>
		</div>
	</div>
	<div class="flex flex-row items-center justify-end gap-2">
		<div class="flex flex-col items-end justify-between gap-1 py-1">
			<div class="relative rounded-md bg-gray-200 dark:bg-zinc-700 min-h-4 h-full">
				{#if tool.farmingForDummies > 0}
					<div
						style="width: {(tool.farmingForDummies / 5) * 100}%;"
						class="absolute rounded-md h-full l-0 bg-green-300 dark:bg-green-600"
					/>
				{/if}
				<p class="relative text-md md:text-lg px-1 z-10 font-mono">
					{STAT_ICONS[Stat.FarmingFortune]}
					{tool.farmingForDummies}/5 FFD
				</p>
				<Popover strategy="fixed" class="z-50" placement="left">
					<p class="whitespace-nowrap">Farming For Dummies</p>
				</Popover>
			</div>
			<div class="relative rounded-md bg-gray-200 dark:bg-zinc-700 min-h-4 h-full">
				{#if tool.getCultivatingLevel() > 0}
					<div
						style="width: {(tool.getCultivatingLevel() / 10) * 100}%;"
						class="absolute rounded-md h-full l-0 bg-green-300 dark:bg-green-600"
					/>
				{/if}
				<p class="relative text-md md:text-lg px-1 z-10 font-mono">{tool.getCultivatingLevel()}/10</p>
				<Popover strategy="fixed" class="z-50" placement="left">
					<p class="whitespace-nowrap">Cultivating Enchant</p>
				</Popover>
			</div>
		</div>
		<Button size="xs" on:click={() => (openModal = true)} color="none">
			<FileLinesSolid size="md" />
		</Button>
	</div>
</div>

<Modal bind:open={openModal} autoclose={true} outsideclose={true} class="bg-zinc-800" color="none">
	<h3 slot="header" class="font-mono text-xl">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html FormatMinecraftText(tool.item.name ?? '')}
	</h3>
	<Lore lore={tool.item.lore ?? []} />
	<div class="text-gray-400">
		{#if tool.cultivating}
			<p>
				<span class="font-semibold select-none">Cultivating:</span>
				<span class="select-all">{tool.cultivating.toLocaleString()}</span>
			</p>
		{/if}
		<p>
			<span class="font-semibold select-none">UUID:</span>
			<span class="select-all">{tool.item.uuid ?? 'N/A'}</span>
		</p>
		<p>
			<span class="font-semibold select-none">Skyblock ID:</span>
			<span class="select-all">{tool.item.skyblockId}</span>
		</p>
	</div>
</Modal>
