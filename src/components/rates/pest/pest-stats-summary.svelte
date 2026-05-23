<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import { getStatColor } from '$lib/format';
	import { cn } from '$lib/utils';
	import * as Popover from '$ui/popover';
	import Info from '@lucide/svelte/icons/info';
	import { STAT_ICONS, STAT_NAMES, Stat, type StatBreakdown } from 'farming-weight';

	interface Entry {
		stat: Stat;
		total: number;
		breakdown: StatBreakdown;
	}

	interface Props {
		entries: Entry[];
	}

	let { entries }: Props = $props();

	const format = (value: number) => (+value.toFixed(2)).toLocaleString();

	function sortedBreakdown(breakdown: StatBreakdown) {
		return Object.entries(breakdown ?? {})
			.map(([key, entry]) => ({
				key,
				value: typeof entry === 'number' ? entry : entry.value,
				stat: typeof entry === 'number' ? undefined : entry.stat,
			}))
			.filter((entry) => entry.value !== 0)
			.sort((a, b) => b.value - a.value);
	}
</script>

<div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
	{#each entries as entry (entry.stat)}
		{@const list = sortedBreakdown(entry.breakdown)}
		{@const accent = getStatColor(entry.stat, 1) ?? 'bg-progress'}
		<div class="bg-card relative flex flex-col gap-3 overflow-hidden rounded-lg border p-4">
			<div class={cn('absolute inset-x-0 top-0 h-1', accent)}></div>
			<div class="flex items-center justify-between gap-2">
				<div class="flex min-w-0 items-center gap-2">
					<span class="text-lg leading-none">{STAT_ICONS[entry.stat]}</span>
					<h2 class="truncate text-sm font-medium tracking-wide uppercase">{STAT_NAMES[entry.stat]}</h2>
				</div>
				{#if list.length > 0}
					<Popover.Mobile>
						{#snippet trigger()}
							<span
								class="text-muted-foreground hover:text-foreground inline-flex size-6 items-center justify-center rounded-md transition-colors"
								aria-label="{STAT_NAMES[entry.stat]} breakdown"
							>
								<Info class="size-4" />
							</span>
						{/snippet}
						<div class="flex max-w-xs flex-col gap-2">
							<p class="text-base font-semibold">{STAT_NAMES[entry.stat]} Breakdown</p>
							<div class="flex flex-col gap-1">
								{#each list as item (item.key)}
									<div
										class="even:bg-card flex flex-row justify-between gap-6 rounded-sm p-0.5 pb-1 text-sm leading-none"
									>
										<div class="flex items-center gap-1">
											{#if item.stat}
												<span>{STAT_ICONS[item.stat] ?? ''}</span>
											{/if}
											{#if item.key.includes('§')}
												<FormattedText text={item.key} />
											{:else}
												<p>{item.key}</p>
											{/if}
										</div>
										<p class="font-mono">{format(item.value)}</p>
									</div>
								{/each}
							</div>
							<div class="text-primary flex flex-row justify-between p-1 text-sm font-semibold">
								<p>Total</p>
								<p class="font-mono">{format(entry.total)}</p>
							</div>
						</div>
					</Popover.Mobile>
				{/if}
			</div>
			<div class="font-mono text-3xl font-semibold tabular-nums">{format(entry.total)}</div>
		</div>
	{/each}
</div>
