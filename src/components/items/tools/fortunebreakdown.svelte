<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';
	import { STAT_ICONS, Stat } from 'farming-weight';
	import * as Popover from '$ui/popover';

	export let title = 'Farming Fortune Breakdown';
	export let total: number | undefined = undefined;
	export let breakdown: Record<string, number> | undefined = undefined;

	$: list = Object.entries(breakdown ?? {}).sort(([, a], [, b]) => b - a);
	$: sum = total ?? list.reduce((acc, [, value]) => acc + value, 0);
</script>

<Popover.Mobile>
	<div
		slot="trigger"
		class="flex flex-row items-center relative rounded-md bg-green-400 dark:bg-green-700 min-h-4 h-full"
	>
		<p class="relative text-md md:text-lg px-1 z-10 font-mono">
			{STAT_ICONS[Stat.FarmingFortune]}&nbsp;{sum.toLocaleString()}&nbsp;
		</p>
	</div>
	{#if list.length > 0}
		<div class="flex flex-col gap-2 max-w-xs">
			<div>
				<p class="font-semibold text-lg">{title}</p>
			</div>

			<div class="flex flex-col gap-1">
				{#each list as [key, value] (key)}
					<div
						class="flex flex-row gap-8 justify-between text-base even:bg-primary-foreground leading-none p-0.5 pb-1 rounded-sm"
					>
						{#if key.includes('§')}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<p>{@html FormatMinecraftText(key ?? '')}</p>
						{:else}
							<p>{key}</p>
						{/if}
						<p>{value.toLocaleString()}</p>
					</div>
				{/each}
			</div>

			<div class="flex flex-row justify-between font-semibold text-base text-black dark:text-white p-1">
				<p>Total</p>
				<p>{sum.toLocaleString()}</p>
			</div>
			<div class="break-words">
				<slot />
			</div>
		</div>
	{/if}
</Popover.Mobile>
