<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';
	import { STAT_ICONS, Stat } from 'farming-weight';
	import * as Popover from '$ui/popover';

	interface Props {
		title?: string;
		total?: number | undefined;
		breakdown?: Record<string, number> | undefined;
		enabled?: boolean;
		small?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		title = 'Farming Fortune Breakdown',
		total = undefined,
		breakdown = undefined,
		enabled = true,
		small = false,
		children
	}: Props = $props();

	let background = $derived(enabled ? 'bg-green-400 dark:bg-green-700' : 'bg-green-400/40 dark:bg-green-700/40');

	let list = $derived(Object.entries(breakdown ?? {}).sort(([, a], [, b]) => b - a));
	let sum = $derived(total ?? list.reduce((acc, [, value]) => acc + value, 0));
</script>

{#if list.length <= 0}
	<div class="flex flex-row items-center relative rounded-md min-h-4 h-full {background}">
		<p class="relative {small ? 'text-sm md:text-md' : 'text-md md:text-lg'} px-1 z-10 font-mono">
			{STAT_ICONS[Stat.FarmingFortune]}&nbsp;{(+sum.toFixed(2)).toLocaleString()}&nbsp;
		</p>
	</div>
{:else}
	<Popover.Mobile>
		{#snippet trigger()}
			<div  class="flex flex-row items-center relative rounded-md min-h-4 h-full {background}">
				<p class="relative {small ? 'text-sm md:text-md' : 'text-md md:text-lg'} px-1 z-10 font-mono">
					{STAT_ICONS[Stat.FarmingFortune]}&nbsp;{(+sum.toFixed(2)).toLocaleString()}&nbsp;
				</p>
			</div>
		{/snippet}
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
						<p>{(+value.toFixed(2)).toLocaleString()}</p>
					</div>
				{/each}
			</div>

			<div class="flex flex-row justify-between font-semibold text-base text-black dark:text-white p-1">
				<p>Total</p>
				<p>{(+sum.toFixed(2)).toLocaleString()}</p>
			</div>
			<div class="break-words">
				{@render children?.()}
			</div>
		</div>
	</Popover.Mobile>
{/if}
