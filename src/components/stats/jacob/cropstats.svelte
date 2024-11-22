<script lang="ts">
	import * as Popover from '$ui/popover';
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	interface Props {
		jacob: components['schemas']['JacobDataDto'] | undefined | null;
	}

	let { jacob }: Props = $props();

	let highest = $derived(
		Object.entries(
			jacob?.contests?.reduce(
				(acc, contest) => {
					if (!contest?.crop) return acc;

					if (contest.crop in acc) {
						acc[contest.crop]++;
					} else {
						acc[contest.crop] = 1;
					}
					return acc;
				},
				{} as Record<string, number>
			) ?? {}
		).sort()
	);

	function pb(crop: string) {
		const amount = jacob?.stats?.personalBests?.[crop.replace(' ', '') as keyof typeof jacob.stats.personalBests];
		return amount ? +amount : undefined;
	}

	const medals = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

	function medal(crop: string) {
		const medal = jacob?.stats?.brackets?.[crop.replace(' ', '') as keyof typeof jacob.stats.brackets];
		return medal ? medals[+medal - 1] : undefined;
	}
</script>

<div class="flex max-w-5xl flex-wrap items-center justify-center gap-4">
	{#each highest as [crop, amount] (crop)}
		{@const unique = medal(crop)}

		<div class="flex flex-1 basis-48 flex-row items-center justify-between rounded-md bg-primary-foreground p-2">
			<div class="flex flex-row items-center gap-2">
				<img src={PROPER_CROP_TO_IMG[crop]} alt="Crop" class="pixelated h-12 w-12 p-1" />

				<div class="flex flex-col items-start gap-1">
					<Popover.Mobile>
						{#snippet trigger()}
							<p class="text-lg leading-none">
								{pb(crop)?.toLocaleString() ?? 'Not Set!'}
							</p>
						{/snippet}
						<div>
							<p>The highest placement earned for {crop}!</p>
						</div>
					</Popover.Mobile>

					<Popover.Mobile>
						{#snippet trigger()}
							<p class="participation-count text-lg leading-none">
								x{amount.toLocaleString()}
							</p>
						{/snippet}
						<div>
							<p>The amount of participations for {crop}!</p>
						</div>
					</Popover.Mobile>
				</div>
			</div>

			{#if unique}
				<img
					src="/images/medals/{unique}.webp"
					alt="{unique} Medal"
					class="pixelated highest-bracket h-10 w-10 p-1"
				/>
			{/if}
		</div>
	{/each}
</div>
