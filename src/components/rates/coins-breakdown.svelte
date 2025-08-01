<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';
	import * as Popover from '$ui/popover';

	interface Props {
		title?: string;
		coins: number;
		breakdown?: Record<string, number>;
		small?: boolean;
		children?: import('svelte').Snippet;
	}

	let { coins, breakdown, small, children, title = 'Coins' }: Props = $props();

	let readable = $derived(Math.round(coins).toLocaleString());

	let list = $derived(
		Object.entries(breakdown ?? {})
			.filter(([, v]) => v !== 0)
			.sort(([, a], [, b]) => b - a)
	);
</script>

{#if list.length <= 0}
	<div class="bg-completed/80 relative flex h-full min-h-6 max-w-fit flex-row items-center gap-1.5 rounded-md px-1">
		<span class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none">
			{readable}
		</span>
	</div>
{:else}
	<Popover.Mobile>
		{#snippet trigger()}
			<div class="bg-completed/80 relative flex h-full min-h-6 flex-row items-center gap-1.5 rounded-md px-1">
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
				{#each list as [key, value] (key)}
					<div
						class="even:bg-card flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none"
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

			<div class="text-primary flex flex-row justify-between p-1 text-base font-semibold">
				<p>Total</p>
				<p>{Math.round(coins).toLocaleString()}</p>
			</div>
			<div class="break-words">
				{@render children?.()}
			</div>
		</div>
	</Popover.Mobile>
{/if}
