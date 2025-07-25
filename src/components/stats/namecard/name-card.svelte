<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import WeightNum from './weight-num.svelte';
	import { drawBackgroundCanvas } from '$lib/styles/maker';
	import { isValidWeightStyle } from '$lib/styles/style';
	import TextElement from './text-element.svelte';

	const ctx = getStatsContext();
	const style = $derived(isValidWeightStyle(ctx.style?.data) ? ctx.style.data : undefined);
	const rank = $derived(ctx.allRanks?.farmingweight?.rank ?? -1);
	const rankText = $derived(rank !== -1 ? `#${rank}` : '');
</script>

<div
	class="bg-background relative mx-auto mt-4 w-full max-w-5xl overflow-clip rounded-xl border-2 bg-no-repeat md:mt-8 md:aspect-[4.8/1] lg:mt-16"
>
	<canvas
		{@attach (element) => {
			if (element) {
				drawBackgroundCanvas(element, style);
			}
		}}
		class="z-0 w-full max-w-5xl bg-no-repeat md:aspect-[4.8/1]"
	>
	</canvas>
	<div class="absolute top-0 right-0 bottom-0 left-0 z-10 flex h-full flex-row items-center justify-between p-4">
		<div class="flex h-full flex-row items-start justify-between md:gap-4">
			<img
				class="aspect-[1/1.3] max-h-full flex-1 self-center object-contain"
				src="https://mc-heads.net/body/{ctx.uuid}"
				alt="User's Minecraft appearance"
			/>
			<div class="flex h-full flex-col items-start justify-center gap-1">
				<div class="flex flex-row items-center gap-2">
					<PlayerName />
					{#if rankText}
						<TextElement class="h-full" element={style?.elements?.rank}>
							<a
								class="bg-card hover:bg-muted flex h-full max-w-fit flex-col items-center justify-center rounded-md p-1 lg:p-1"
								href="/leaderboard/farmingweight/{ctx.ign}-{ctx.selectedProfile?.profileName}"
							>
								<span class="mx-1 px-2 font-mono text-3xl">
									<span class="mr-0.5 text-xl">#</span>{rank}
								</span>
							</a>
						</TextElement>
					{/if}
				</div>
				<TextElement element={style?.elements?.weight}>
					<WeightNum />
				</TextElement>
			</div>
		</div>
		<div class="flex-1"></div>
	</div>
</div>
