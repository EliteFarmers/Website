<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';
	import { Button, Modal } from 'flowbite-svelte';
	import Lore from './lore.svelte';
	import { FileLinesSolid } from 'flowbite-svelte-icons';
	import type { EliteItemDto } from 'farming-weight';

	export let item: EliteItemDto;

	let openModal = false;
</script>

<Button size="xs" on:click={() => (openModal = true)} color="none">
	<FileLinesSolid size="md" />
</Button>

<Modal bind:open={openModal} autoclose={true} outsideclose={true} class="bg-zinc-800" color="none">
	<h3 slot="header" class="font-mono text-xl">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html FormatMinecraftText(item.name ?? '')}
	</h3>
	<Lore lore={item.lore?.slice() ?? []} />
	<div class="text-gray-400">
		<slot />
		<p>
			<span class="font-semibold select-none">UUID:</span>
			<span class="select-all">{item.uuid ?? 'N/A'}</span>
		</p>
		<p>
			<span class="font-semibold select-none">Skyblock ID:</span>
			<span class="select-all">{item.skyblockId}</span>
		</p>
	</div>
</Modal>
