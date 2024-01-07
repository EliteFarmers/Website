<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';
	import { STAT_ICONS, Stat } from 'farming-weight';
	import { Popover } from 'flowbite-svelte';

	export let title = 'Farming Fortune Breakdown';
	export let total: number | undefined = undefined;
	export let breakdown: Record<string, number> | undefined = undefined;
	export let placement: Popover['$$prop_def']['placement'] = 'left';

	$: list = Object.entries(breakdown ?? {}).sort(([, a], [, b]) => b - a);
	$: sum = total ?? list.reduce((acc, [, value]) => acc + value, 0);
</script>

<div class="relative rounded-md bg-green-300 dark:bg-green-600 min-h-4 h-full">
	<p class="relative text-md md:text-lg px-1 z-10 font-mono">
		{STAT_ICONS[Stat.FarmingFortune]}&nbsp;{sum.toLocaleString()}&nbsp;
	</p>
	{#if list.length > 0}
		<Popover strategy="fixed" class="z-50 max-w-xs" {placement} {title}>
			<div class="flex flex-col gap-2">
				{#each list as [key, value] (key)}
					<div class="flex flex-row gap-8 justify-between">
						{#if key.includes('§')}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<p>{@html FormatMinecraftText(key ?? '')}</p>
						{:else}
							<p>{key}</p>
						{/if}
						<p>{value.toLocaleString()}</p>
					</div>
				{/each}
				<div class="flex flex-row justify-between font-semibold text-black dark:text-white">
					<p>Total</p>
					<p>{sum.toLocaleString()}</p>
				</div>
				<slot />
			</div>
		</Popover>
	{/if}
</div>
