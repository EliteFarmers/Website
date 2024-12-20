<script lang="ts">
	import * as Popover from '$comp/ui/popover';

	interface Props {
		medals?: {
			diamond: number;
			platinum: number;
			gold: number;
			silver: number;
			bronze: number;
		};
		participations?: number;
	}

	let {
		medals = {
			diamond: 0,
			platinum: 0,
			gold: 0,
			silver: 0,
			bronze: 0,
		},
		participations = 0,
	}: Props = $props();
</script>

<div class="flex flex-wrap justify-center gap-2 md:flex-row md:gap-4">
	{#if participations}
		<div class="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary-foreground">
			<Popover.Mobile>
				{#snippet trigger()}
					<p class="p-2 text-xl font-semibold leading-none md:px-2">
						{participations.toLocaleString()}
					</p>
				{/snippet}
				<div>
					<p>The number of contests participated in!</p>
				</div>
			</Popover.Mobile>
		</div>
	{/if}
	{#each Object.entries(medals) as [medal, amount] (medal)}
		<div
			class="flex min-w-16 max-w-24 flex-1 basis-8 items-center justify-center gap-2 rounded-md bg-primary-foreground p-1 md:p-2"
		>
			<img src="/images/medals/{medal}.webp" alt={medal} class="pixelated size-6 md:size-8" />
			<p class="text-2xl font-semibold">
				{amount.toLocaleString()}
			</p>
		</div>
	{/each}
</div>
