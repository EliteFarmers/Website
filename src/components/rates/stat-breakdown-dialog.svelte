<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import { cn } from '$lib/utils';
	import * as Dialog from '$ui/dialog';
	import { ScrollArea } from '$ui/scroll-area';
	import * as Tooltip from '$ui/tooltip';
	import Info from '@lucide/svelte/icons/info';
	import { STAT_ICONS, STAT_NAMES, Stat, type StatBreakdown } from 'farming-weight';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type BreakdownValue = number | { value: number; stat: Stat };

	interface BreakdownItem {
		key: string;
		value: number;
		stat?: Stat;
	}

	type TriggerProps = HTMLButtonAttributes & {
		type: 'button';
		onclick: () => void;
		'aria-label': string;
	};

	interface TriggerData {
		props: TriggerProps;
		list: BreakdownItem[];
		title: string;
		total: number;
	}

	interface Props {
		title: string;
		total?: number;
		stat?: Stat;
		breakdown?: Record<string, BreakdownValue> | StatBreakdown;
		class?: string;
		tooltip?: string;
		trigger?: Snippet<[TriggerData]>;
		children?: Snippet;
	}

	let {
		title,
		total = undefined,
		stat = undefined,
		breakdown = undefined,
		class: className,
		tooltip = 'Click to view breakdown',
		trigger,
		children,
	}: Props = $props();

	let open = $state(false);

	const format = (value: number) => (+safeNumber(value).toFixed(2)).toLocaleString();
	const safeNumber = (value: number | undefined | null) => (Number.isFinite(value ?? NaN) ? (value as number) : 0);

	function openDialog() {
		if (!hasContent) return;
		open = true;
	}

	let list = $derived(
		Object.entries(breakdown ?? {})
			.map(([key, entry]) => ({
				key,
				value: typeof entry === 'number' ? entry : entry.value,
				stat: typeof entry === 'number' ? stat : entry.stat,
			}))
			.filter((entry) => entry.value !== 0)
			.sort((a, b) => b.value - a.value)
	);

	let displayTotal = $derived(total ?? list.reduce((sum, entry) => sum + entry.value, 0));
	let hasContent = $derived(list.length > 0 || !!children);

	let triggerData = $derived({
		props: {
			type: 'button' as const,
			onclick: openDialog,
			'aria-label': title,
		},
		list,
		title,
		total: displayTotal,
	});
</script>

{#if hasContent}
	<Tooltip.Simple side="top">
		{#snippet child({ props })}
			{@const tooltipTriggerData = {
				...triggerData,
				props: {
					...props,
					...triggerData.props,
				} as TriggerProps,
			}}
			{#if trigger}
				{@render trigger(tooltipTriggerData)}
			{:else}
				<button
					{...tooltipTriggerData.props}
					class="hover:bg-accent hover:text-accent-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
				>
					<Info class="size-4" />
				</button>
			{/if}
		{/snippet}
		<p>{tooltip}</p>
	</Tooltip.Simple>

	<Dialog.Root bind:open>
		<Dialog.Content
			class={cn(
				'max-h-[80vh] max-w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-xl',
				className
			)}
		>
			<Dialog.Header class="border-b p-4 pr-10">
				<div class="flex min-w-0 items-center gap-2">
					{#if stat}
						<span class="text-lg leading-none">{STAT_ICONS[stat] ?? ''}</span>
					{/if}
					<Dialog.Title class="truncate">{title}</Dialog.Title>
				</div>
			</Dialog.Header>

			<ScrollArea class="min-h-0 overflow-hidden">
				<div class="flex flex-col gap-1 p-4">
					{#each list as item (item.key)}
						<div
							class="even:bg-card flex flex-row justify-between gap-6 rounded-sm p-1 text-sm leading-tight"
						>
							<div class="flex min-w-0 flex-col">
								<div class="flex min-w-0 items-center gap-1">
									{#if item.stat}
										<span class="shrink-0">{STAT_ICONS[item.stat] ?? ''}</span>
									{/if}
									{#if item.key.includes('§')}
										<FormattedText text={item.key} />
									{:else}
										<p class="min-w-0 truncate">{item.key}</p>
									{/if}
								</div>
								{#if item.stat && item.stat !== stat}
									<p class="text-muted-foreground text-xs">{STAT_NAMES[item.stat] ?? item.stat}</p>
								{/if}
							</div>
							<p class="shrink-0 font-mono tabular-nums">{format(item.value)}</p>
						</div>
					{/each}
				</div>
				{#if children}
					<div class="text-muted-foreground mt-4 text-sm wrap-break-word">
						{@render children()}
					</div>
				{/if}
			</ScrollArea>

			<div
				class="bg-background text-primary flex flex-row justify-between gap-4 border-t p-4 text-sm font-semibold"
			>
				<p>Total</p>
				<p class="font-mono tabular-nums">{format(displayTotal)}</p>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
