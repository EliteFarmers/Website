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
		max?: number;
		children?: import('svelte').Snippet;
	}

	let {
		title = 'Farming Fortune Breakdown',
		total = undefined,
		breakdown = undefined,
		enabled = true,
		small = false,
		max = undefined,
		children,
	}: Props = $props();

	let list = $derived(Object.entries(breakdown ?? {}).sort(([, a], [, b]) => b - a));
	let sum = $derived(total ?? list.reduce((acc, [, value]) => acc + value, 0));
	let maxed = $derived(max !== undefined && sum >= max);

	let background = $derived(
		enabled
			? `bg-green-400 dark:bg-green-700 ${maxed ? 'bg-yellow-400 dark:bg-yellow-700' : ''}`
			: `bg-green-400/40 dark:bg-green-700/40 ${maxed ? 'bg-yellow-400/40 dark:bg-yellow-700/40' : ''}`
	);
</script>

{#if list.length <= 0}
	<div class="relative flex h-full min-h-4 flex-row items-center rounded-md {background}">
		<p class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 px-1 font-mono">
			{STAT_ICONS[Stat.FarmingFortune]}&nbsp;{(+sum.toFixed(2)).toLocaleString()}&nbsp;
		</p>
	</div>
{:else}
	<Popover.Mobile>
		{#snippet trigger()}
			<div class="relative flex h-full min-h-4 flex-row items-center rounded-md {background}">
				<p class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 px-1 font-mono">
					{STAT_ICONS[Stat.FarmingFortune]}&nbsp;{(+sum.toFixed(2)).toLocaleString()}&nbsp;
				</p>
			</div>
		{/snippet}
		<div class="flex max-w-xs flex-col gap-2">
			<div>
				<p class="text-lg font-semibold">{title}</p>
			</div>

			<div class="flex flex-col gap-1">
				{#each list as [key, value] (key)}
					<div
						class="flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none even:bg-primary-foreground"
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

			<div class="flex flex-row justify-between p-1 text-base font-semibold text-black dark:text-white">
				<p>Total</p>
				<p>{(+sum.toFixed(2)).toLocaleString()}</p>
			</div>
			<div class="break-words">
				{@render children?.()}
			</div>
		</div>
	</Popover.Mobile>
{/if}
