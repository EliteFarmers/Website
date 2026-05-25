<script lang="ts">
	import StatBreakdownDialog from '$comp/rates/stat-breakdown-dialog.svelte';
	import { getStatColor } from '$lib/format';
	import { cn } from '$lib/utils';
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
</script>

<div class="flex flex-row gap-4 max-md:flex-wrap">
	{#each entries as entry (entry.stat)}
		{@const accent = getStatColor(entry.stat, 1) ?? 'bg-progress'}
		<div class="bg-card relative flex w-fit flex-col gap-3 overflow-hidden rounded-lg border p-4 md:flex-1">
			<div class={cn('absolute inset-x-0 top-0 h-1', accent)}></div>
			<div class="flex items-center justify-between gap-2">
				<div class="flex min-w-0 items-center gap-2">
					<span class="text-lg leading-none">{STAT_ICONS[entry.stat]}</span>
					<h2 class="truncate text-sm font-medium tracking-wide uppercase">{STAT_NAMES[entry.stat]}</h2>
				</div>
				<StatBreakdownDialog
					title="{STAT_NAMES[entry.stat]} Breakdown"
					stat={entry.stat}
					total={entry.total}
					breakdown={entry.breakdown}
				>
					{#snippet trigger({ props })}
						<button
							{...props}
							class="text-muted-foreground hover:text-foreground inline-flex size-6 items-center justify-center rounded-md transition-colors"
							aria-label="View breakdown"
						>
							<Info class="size-4" />
						</button>
					{/snippet}
				</StatBreakdownDialog>
			</div>
			<div class="font-mono text-3xl font-semibold tabular-nums">{format(entry.total)}</div>
		</div>
	{/each}
</div>
