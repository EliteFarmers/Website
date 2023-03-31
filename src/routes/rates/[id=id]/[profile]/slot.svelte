<script lang="ts">
	import { InsertColorCodes } from "$lib/format";
	import type { ItemStack } from "$lib/skyblock";

	export let item: ItemStack | null = null;
</script>

<div class="p-2 rounded-md w-full min-w-full inline-block aspect-square bg-gray-200 dark:bg-zinc-900">
	{#if item}
		<div class="flex flex-col items-center justify-center h-full">
			<!-- <img class="w-16 h-16" src="https://sky.shiiyu.moe/api/v2/item/{item.id}" alt="{item.tag}" /> -->
			<p class="text-sm">{@html InsertColorCodes(item.tag.display.Name)}</p>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center h-full text-center w-full">
			<slot/>
		</div>
	{/if}
</div>