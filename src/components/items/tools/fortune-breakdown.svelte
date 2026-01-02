<script lang="ts">
	import { cn } from '$lib/utils';
	import * as Popover from '$ui/popover';
	import { STAT_ICONS, Stat } from 'farming-weight';
	import FormattedText from '../formatted-text.svelte';

	interface Props {
		title?: string;
		total?: number | undefined;
		breakdown?: Record<string, number | { value: number; stat: Stat }> | undefined;
		enabled?: boolean;
		small?: boolean;
		max?: number;
		child?: import('svelte').Snippet | undefined;
		children?: import('svelte').Snippet;
		class?: string;
	}

	let {
		title = 'Farming Fortune Breakdown',
		total = undefined,
		breakdown = undefined,
		enabled = true,
		small = false,
		max = undefined,
		class: className,
		child,
		children,
	}: Props = $props();

	let list = $derived(
		Object.entries(breakdown ?? {})
			.map(([k, v]) => {
				if (typeof v === 'number') return [k, v] as const;
				return [k, v.value] as const;
			})
			.sort(([, a], [, b]) => b - a)
	);
	let sum = $derived(total ?? list.reduce((acc, [, value]) => acc + value, 0));
	let maxed = $derived(max !== undefined && sum >= max);

	let background = $derived(
		enabled
			? maxed
				? 'bg-completed'
				: sum < 0
					? 'bg-destructive/60'
					: 'bg-progress'
			: maxed
				? 'bg-completed/40'
				: sum < 0
					? 'bg-destructive/40'
					: 'bg-progress/40'
	);
</script>

{#if list.length <= 0 && !child}
	<div
		class={cn(
			'relative flex max-h-fit min-h-4 max-w-fit flex-row items-center gap-1.5 rounded-md px-1',
			background,
			className
		)}
	>
		<span>{STAT_ICONS[Stat.FarmingFortune]}</span>
		<span class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none">
			{(+sum.toFixed(2)).toLocaleString()}
		</span>
	</div>
{:else}
	<Popover.Mobile>
		{#snippet trigger()}
			<div
				class={cn(
					'relative flex h-full min-h-4 flex-row items-center gap-1.5 rounded-md px-1',
					background,
					className
				)}
			>
				<span>{STAT_ICONS[Stat.FarmingFortune]}</span>
				<span
					class="relative {small
						? 'md:text-md text-sm'
						: 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none"
				>
					{(+sum.toFixed(2)).toLocaleString()}
				</span>
			</div>
		{/snippet}
		{#if child}
			{@render child?.()}
		{:else}
			<div class="flex max-w-xs flex-col gap-2">
				<div>
					<p class="text-lg font-semibold">{title}</p>
				</div>

				<div class="flex flex-col gap-1">
					{#each list as [key, value] (key)}
						<div
							class="even:bg-card flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none"
						>
							{#if key.includes('§')}
								<FormattedText text={key} />
							{:else}
								<p>{key}</p>
							{/if}
							<p>{(+value.toFixed(2)).toLocaleString()}</p>
						</div>
					{/each}
				</div>

				<div class="text-primary flex flex-row justify-between p-1 text-base font-semibold">
					<p>Total</p>
					<p>{(+sum.toFixed(2)).toLocaleString()}</p>
				</div>
				<div class="wrap-break-word">
					{@render children?.()}
				</div>
			</div>
		{/if}
	</Popover.Mobile>
{/if}
