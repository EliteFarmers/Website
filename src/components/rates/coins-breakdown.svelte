<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import * as Popover from '$ui/popover';
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';

	interface Props {
		title?: string;
		coins: number;
		breakdown?: Record<string, number>;
		list?: Record<string, { count: number; cost: number }>;
		small?: boolean;
		children?: import('svelte').Snippet;
	}

	let { coins, breakdown, small, children, title = 'Coins', list }: Props = $props();

	let readable = $derived(Math.round(coins).toLocaleString());

	let itemList = $derived(
		breakdown
			? Object.entries(breakdown).map(([key, value]) => {
					return [key, { count: 0, cost: value }] as [string, { count: number; cost: number }];
				})
			: list
				? Object.entries(list)
				: undefined
	);

	let items = $derived(
		itemList?.sort(([, a], [, b]) => b.cost - a.cost).filter(([, value]) => value.cost !== 0) ?? []
	);
</script>

{#if items.length <= 0}
	<div class="bg-completed/60 relative flex h-full min-h-6 max-w-fit flex-row items-center gap-1.5 rounded-md px-0.5">
		<CircleDollarSign class="size-5" />
		<span class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none">
			{readable}
		</span>
	</div>
{:else}
	<Popover.Mobile>
		{#snippet trigger()}
			<div class="bg-completed/60 relative flex h-full min-h-6 flex-row items-center gap-1.5 rounded-md px-0.5">
				<CircleDollarSign class="size-5" />
				<span
					class="relative {small
						? 'md:text-md text-sm'
						: 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none"
				>
					{readable}
				</span>
			</div>
		{/snippet}

		<div class="flex max-w-xs flex-col gap-2">
			<div>
				<p class="text-lg font-semibold">{title}</p>
			</div>

			<div class="flex flex-col gap-1">
				{#each items as [key, value] (key)}
					<div
						class="even:bg-card flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none"
					>
						<p>
							{#if value.count}
								<span class="font-semibold">{value.count.toLocaleString()}x</span>
							{/if}
							{#if key.includes('§')}
								<FormattedText text={key ?? ''} />
							{:else}
								{key}
							{/if}
						</p>
						{#if value.cost === -1}
							<p class="text-destructive">N/A</p>
						{:else}
							<p>{Math.round(value.cost).toLocaleString()}</p>
						{/if}
					</div>
				{/each}
			</div>

			<div class="text-primary flex flex-row justify-between p-1 text-base font-semibold">
				<p>Total</p>
				<p>{Math.round(coins).toLocaleString()}</p>
			</div>
			<div class="wrap-break-word">
				{@render children?.()}
			</div>
		</div>
	</Popover.Mobile>
{/if}
