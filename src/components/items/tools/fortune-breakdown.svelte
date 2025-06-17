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
		child?: import('svelte').Snippet | undefined;
		children?: import('svelte').Snippet;
	}

	let {
		title = 'Farming Fortune Breakdown',
		total = undefined,
		breakdown = undefined,
		enabled = true,
		small = false,
		max = undefined,
		child,
		children,
	}: Props = $props();

	let list = $derived(Object.entries(breakdown ?? {}).sort(([, a], [, b]) => b - a));
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
	<div class="relative flex h-full min-h-4 max-w-fit flex-row items-center rounded-md {background} gap-1.5 px-1">
		<span>{STAT_ICONS[Stat.FarmingFortune]}</span>
		<span class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none">
			{(+sum.toFixed(2)).toLocaleString()}
		</span>
	</div>
{:else}
	<Popover.Mobile triggerRootClass="h-[28px]">
		{#snippet trigger()}
			<div class="relative flex h-full min-h-4 flex-row items-center rounded-md {background} gap-1.5 px-1">
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
							class="flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none even:bg-card"
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

				<div class="flex flex-row justify-between p-1 text-base font-semibold text-primary">
					<p>Total</p>
					<p>{(+sum.toFixed(2)).toLocaleString()}</p>
				</div>
				<div class="break-words">
					{@render children?.()}
				</div>
			</div>
		{/if}
	</Popover.Mobile>
{/if}
