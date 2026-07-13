<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
	import Info from '@lucide/svelte/icons/info';
	import type { PestRateBreakdownLine, PestRateBreakdownRow } from './pest-rate-breakdown-model';

	type LineGroup = {
		name: string;
		lines: PestRateBreakdownLine[];
		total: number;
	};

	interface Props {
		row: PestRateBreakdownRow;
	}

	let { row }: Props = $props();

	function safeNumber(value: number | undefined | null) {
		return Number.isFinite(value ?? NaN) ? (value as number) : 0;
	}

	function formatNumber(value: number, maximumFractionDigits = 0) {
		return safeNumber(value).toLocaleString(undefined, { maximumFractionDigits });
	}

	function formatCompactRateValue(value: number) {
		return safeNumber(value).toLocaleString(undefined, {
			maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
		});
	}

	function formatRate(value: number) {
		return `${formatNumber(value)}/hr`;
	}

	function formatLineQuantity(value: number | undefined) {
		return value === undefined ? '-' : `${formatCompactRateValue(value)}/hr`;
	}

	function getPriceSourceLabel(source: string | undefined) {
		if (!source) return undefined;
		if (source === 'npc') return 'NPC';
		if (source === 'bazaar') return 'BZ';
		if (source === 'auction') return 'AH';
		if (source === 'manual') return 'manual';
		return source;
	}

	function formatLinePrice(value: number | undefined, source?: string) {
		if (value === undefined) return '-';
		return `${formatCompactRateValue(value)}${source ? ` ${source}` : ''}`;
	}

	function getLineGroups(lines: PestRateBreakdownLine[]): LineGroup[] {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const groups = new Map<string, PestRateBreakdownLine[]>();
		for (const line of lines) {
			const groupName = line.group || 'Line Items';
			groups.set(groupName, [...(groups.get(groupName) ?? []), line]);
		}

		return [...groups.entries()]
			.map(([name, groupLines]) => ({
				name,
				lines: groupLines,
				total: groupLines.reduce((sum, line) => sum + line.value, 0),
			}))
			.sort((a, b) => Math.abs(b.total) - Math.abs(a.total) || a.name.localeCompare(b.name));
	}

	const lineGroups = $derived(getLineGroups(row.lines));
</script>

<Dialog.Root>
	<Dialog.Trigger
		type="button"
		class={buttonVariants({
			variant: 'ghost',
			size: 'sm',
			class: 'h-8 justify-self-start px-2 sm:justify-self-end',
		})}
	>
		<Info class="size-4" />
		Details
	</Dialog.Trigger>
	<Dialog.ScrollContent parentClass="w-[calc(100vw-1rem)] max-w-6xl sm:w-full" class="p-0">
		<div class="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
			<div class="min-w-0">
				<Dialog.Title class="text-lg leading-tight font-semibold">{row.label}</Dialog.Title>
				<Dialog.Description class="text-muted-foreground mt-1 text-sm">
					{row.detail}
				</Dialog.Description>
			</div>
			<p
				class={cn(
					'font-mono text-lg leading-tight font-semibold whitespace-nowrap tabular-nums sm:text-right',
					row.value < 0 && 'text-destructive'
				)}
			>
				{formatRate(row.value)}
			</p>
		</div>

		<div class="p-4 sm:p-6">
			<div class="flex min-w-0 flex-col gap-4">
				{#if lineGroups.length}
					{#each lineGroups as group (group.name)}
						<section class="overflow-hidden rounded-md border">
							<header
								class="bg-muted/30 grid gap-2 border-b px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center"
							>
								<div class="min-w-0">
									<h3 class="truncate font-semibold">{group.name}</h3>
								</div>
								<p
									class={cn(
										'font-mono text-sm font-semibold tabular-nums sm:text-right',
										group.total < 0 && 'text-destructive'
									)}
								>
									{formatRate(group.total)}
								</p>
							</header>
							<div
								class="bg-background text-muted-foreground hidden gap-3 border-b px-3 py-2 text-xs font-semibold uppercase sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_7rem_8rem]"
							>
								<span>Line Item</span>
								<span class="text-right">Qty/hr</span>
								<span class="text-right">Unit</span>
								<span class="text-right">Coins/hr</span>
							</div>
							<div class="divide-y">
								{#each group.lines as line (line.key)}
									<div
										class="grid gap-2 px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_7rem_7rem_8rem] sm:items-center"
									>
										<div class="flex min-w-0 items-center gap-3">
											{#if line.itemId}
												<div
													class="bg-background flex size-8 shrink-0 items-center justify-center rounded-md border"
												>
													<ItemRender skyblockId={line.itemId} class="size-8" />
												</div>
											{:else}
												<div
													class="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md border"
												>
													<CircleDollarSign class="size-4" />
												</div>
											{/if}
											<div class="min-w-0">
												<p class="truncate font-medium">{line.label}</p>
											</div>
										</div>
										<div class="flex justify-between gap-3 sm:block sm:text-right">
											<span class="text-muted-foreground text-xs sm:hidden">Qty/hr</span>
											<span class="font-mono text-xs tabular-nums">
												{formatLineQuantity(line.quantity)}
											</span>
										</div>
										<div class="flex justify-between gap-3 sm:block sm:text-right">
											<span class="text-muted-foreground text-xs sm:hidden">Unit</span>
											<span class="font-mono text-xs tabular-nums">
												{formatLinePrice(line.price, getPriceSourceLabel(line.priceSource))}
											</span>
										</div>
										<div class="flex justify-between gap-3 sm:block sm:text-right">
											<span class="text-muted-foreground text-xs sm:hidden">Coins/hr</span>
											<span
												class={cn(
													'font-mono text-xs font-semibold tabular-nums',
													line.value < 0 ? 'text-destructive' : 'text-foreground'
												)}
											>
												{formatRate(line.value)}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</section>
					{/each}
				{:else}
					<div class="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
						No priced line items for this source.
					</div>
				{/if}
			</div>
		</div>
	</Dialog.ScrollContent>
</Dialog.Root>
