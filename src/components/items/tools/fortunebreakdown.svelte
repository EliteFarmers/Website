<script lang="ts">
	import { STAT_ICONS, Stat } from 'farming-weight';
	import { Popover } from 'flowbite-svelte';

	export let total: number | undefined;
	export let breakdown: Record<string, number>;

	$: list = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
	$: sum = total ?? list.reduce((acc, [, value]) => acc + value, 0);
</script>

<div class="relative rounded-md bg-green-300 dark:bg-green-600 min-h-4 h-full">
	<p class="relative text-md md:text-lg px-1 z-10 font-mono">
		{STAT_ICONS[Stat.FarmingFortune]}
		{sum}&nbsp;
	</p>
	<Popover strategy="fixed" class="z-50 max-w-xs" placement="left" title="Farming Fortune Breakdown">
		<div class="flex flex-col gap-2">
			{#each list as [key, value] (key)}
				<div class="flex flex-row justify-between">
					<p>{key}</p>
					<p>{value}</p>
				</div>
			{/each}
			<div class="flex flex-row justify-between font-semibold text-black dark:text-white">
				<p>Total</p>
				<p>{sum}</p>
			</div>
			<slot />
		</div>
	</Popover>
</div>
