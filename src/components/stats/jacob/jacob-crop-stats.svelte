<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { JacobDataDto } from '$lib/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import * as Popover from '$ui/popover';
	import { fortuneFromPersonalBestContest, getCropFromName } from 'farming-weight';

	interface Props {
		jacob: JacobDataDto | undefined | null;
		crop: string;
		count: number;
	}

	let { jacob, crop, count }: Props = $props();

	function fortune(crop: string, collected: number) {
		const c = getCropFromName(crop);
		if (!c) return 0;
		return fortuneFromPersonalBestContest(c, collected);
	}

	function pb(crop: string) {
		const key = crop.replace(' ', '');
		const amount = jacob?.stats?.personalBests?.[key as keyof typeof jacob.stats.personalBests];
		const timestamp = jacob?.stats?.crops?.[key as keyof typeof jacob.stats.crops]?.personalBestTimestamp;
		return { amount: amount ? Number(amount) : undefined, timestamp: timestamp ? Number(timestamp) : undefined };
	}

	const medals = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

	function medal(crop: string) {
		const medal = jacob?.stats?.brackets?.[crop.replace(' ', '') as keyof typeof jacob.stats.brackets];
		return medal ? medals[+medal - 1] : undefined;
	}

	const unique = $derived(medal(crop));
	const pbData = $derived(pb(crop));
	const ff = $derived(fortune(crop, pbData?.amount ?? 0));
</script>

<div class="bg-card flex flex-1 basis-48 flex-row items-center justify-between gap-4 rounded-md p-2 md:max-w-52">
	<div class="flex flex-row items-center gap-2">
		<img src={PROPER_CROP_TO_IMG[crop]} alt="Crop" class="pixelated h-12 w-12 p-1" />

		<div class="flex flex-col items-start gap-1">
			{#if pbData.timestamp}
				<a
					href="/contest/{pbData.timestamp}"
					class="text-lg leading-none font-semibold no-underline hover:underline"
				>
					{pbData.amount?.toLocaleString() ?? 'Not Set!'}
				</a>
			{:else}
				<span class="text-lg leading-none font-semibold no-underline">
					{pbData.amount?.toLocaleString() ?? 'Not Set!'}
				</span>
			{/if}

			<Popover.Mobile>
				{#snippet trigger()}
					<p class="participation-count text-lg leading-none">
						x{count.toLocaleString()}
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
			<FortuneBreakdown total={ff} small={true} max={100} />
		{:else}
			<div class="my-5">
				<FortuneBreakdown total={ff} small={true} max={100} />
			</div>
		{/if}
	</div>
</div>
