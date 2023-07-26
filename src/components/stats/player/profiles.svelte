<script lang="ts">
	import { Popover } from 'flowbite-svelte';
	import { slide } from 'svelte/transition';

	export let ign: string;
	export let selected: { id: string; name: string, gameMode: string, selected: boolean };
	export let profiles: { id: string; name: string, gameMode: string, selected: boolean }[];
</script>

<div class="grid col-span-1 z-10" id="profileName">
	<div class="flex flex-row gap-2 items-center">
		<div class="p-2 mx-1 bg-gray-200 dark:bg-zinc-700 rounded-md">
			<h2 class="text-3xl">
				{selected.name}
			</h2>
		</div>
		<span class="first-letter:capitalize font-semibold text-lg text-gray-500">{selected.gameMode}</span>
	</div>
	{#if profiles.length > 0}
		<Popover 
			triggeredBy="#profileName" 
			class="w-64 text-sm font-light z-10 bg-gray-200 dark:bg-zinc-700" 
			placement="bottom" color="none" border={false} offset={0} arrow={false}
			transition={slide}
		>
			<div class="flex flex-col gap-1">
				{#each profiles ?? [] as pId (pId.id)}
					<a
						href={`/@${ign}/${pId.name}`}
						class="p-2 text-xl font-semibold flex justify-between text-gray-600 hover:text-gray-900 dark:text-zinc-200 dark:hover:text-zinc-400"
						>
						<span>{pId.name}</span>	
						<span class="first-letter:capitalize">{pId.gameMode}</span>
					</a>
				{/each}
			</div>
		</Popover>
	{/if}
</div>

