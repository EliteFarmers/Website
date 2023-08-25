<script lang="ts">
	import type { FarmingTool } from '$lib/calc/fortune';
	import { FormatMinecraftText } from '$lib/format';
	import { Button, Modal } from 'flowbite-svelte';
	import Lore from '../lore.svelte';
	import { FileLinesSolid } from 'flowbite-svelte-icons';

	export let tool: FarmingTool;

	let openModal = false;
</script>

<div
	class="flex basis-[5rem] w-full max-h-30 flex-row gap-2 justify-between bg-gray-100 dark:bg-zinc-800 rounded-md p-2"
>
	<div class="flex flex-row gap-2 items-center">
		<img
			class="w-8 sm:w-12 md:w-16 aspect-square pixelated"
			src={`/packs/hypixelplus/tools/farming/${tool.item.skyblockId?.toLowerCase()}.png`}
			alt="Tool"
		/>
		<div class="flex flex-col items-start">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="font-semibold text-md md:text-lg">{@html FormatMinecraftText(tool.item.name ?? '')}</div>
			<div class="text-md md:text-lg">{tool.farmed.toLocaleString()}</div>
		</div>
	</div>
	<div class="flex flex-col justify-center">
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
