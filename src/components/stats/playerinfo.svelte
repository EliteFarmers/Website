<script lang="ts">
	import Discord from '$comp/stats/player/discord.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import Weight from '$comp/stats/player/weight.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ExternalLinks from './namecard/external-links.svelte';
	import Skyblocklevel from './player/skyblocklevel.svelte';

	const ctx = getStatsContext();
</script>

<section class="mt-8 flex w-full flex-col items-center align-middle">
	<div class="bg-background mx-2 flex w-full max-w-7xl flex-col gap-8 rounded-lg p-4 md:flex-row md:gap-16 md:p-8">
		<div class="flex flex-1 flex-row items-center justify-center gap-6 md:justify-end">
			<img
				class="aspect-auto max-h-40 max-w-16 min-w-12 object-cover"
				src="https://mc-heads.net/body/{ctx.uuid}"
				alt="User's Minecraft appearance"
			/>
			<div class="flex flex-col items-start justify-start gap-1">
				<PlayerName />
				<div class="flex flex-wrap justify-start gap-1 md:flex-row">
					<Skyblocklevel />
					<Discord />
				</div>
				<div class="flex justify-start gap-1">
					<ExternalLinks />
				</div>
			</div>
		</div>
		<div class="flex flex-1 flex-row items-center justify-center gap-6 md:justify-start">
			<Weight />
		</div>
	</div>
</section>
