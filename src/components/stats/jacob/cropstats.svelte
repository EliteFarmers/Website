<script lang="ts">
	import * as Popover from '$ui/popover';
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { fortuneFromPersonalBestContest, getCropFromName } from 'farming-weight';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';

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

	function fortune(crop: string, collected: number) {
		const c = getCropFromName(crop);
		if (!c) return 0;
		return fortuneFromPersonalBestContest(c, collected);
	}

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

<div class="flex max-w-6xl flex-wrap items-center justify-center gap-4">
	{#each highest as [crop, amount] (crop)}
		{@const unique = medal(crop)}
		{@const score = pb(crop)}
		{@const ff = fortune(crop, score ?? 0)}

		<div
			class="flex flex-1 basis-48 flex-row items-center justify-between gap-4 rounded-md bg-primary-foreground p-2 md:max-w-52"
		>
			<div class="flex flex-row items-center gap-2">
				<img src={PROPER_CROP_TO_IMG[crop]} alt="Crop" class="pixelated h-12 w-12 p-1" />

				<div class="flex flex-col items-start gap-1">
					<div>
						<Popover.Mobile>
							{#snippet trigger()}
								<p class="text-lg font-semibold leading-none">
									{score?.toLocaleString() ?? 'Not Set!'}
								</p>
							{/snippet}
							<div>
								<p>The highest placement earned for {crop}!</p>
							</div>
						</Popover.Mobile>
					</div>

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

			<div class="flex flex-col items-end gap-1">
				{#if unique}
					<img
						src="/images/medals/{unique}.webp"
						alt="{unique} Medal"
						class="pixelated highest-bracket h-10 w-10 p-1"
					/>
				{/if}
				<FortuneBreakdown total={ff} small={true} max={100} />
			</div>
		</div>
	{/each}
</div>
