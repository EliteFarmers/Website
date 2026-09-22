<script lang="ts">
	import { page } from '$app/state';
	import StatsHead from '$comp/seo/stats-head.svelte';
	import ComposterUpgrades from '$comp/stats/garden/composter-upgrades.svelte';
	import CropUpgrades from '$comp/stats/garden/crop-upgrades.svelte';
	import GardenChips from '$comp/stats/garden/garden-chips.svelte';
	import Greenhouse from '$comp/stats/garden/greenhouse.svelte';
	import Milestones from '$comp/stats/garden/milestones.svelte';
	import MissingVisitors from '$comp/stats/garden/missing-visitors.svelte';
	import Plots from '$comp/stats/garden/plots.svelte';
	import VisitorList from '$comp/stats/garden/visitor-list.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import GardenStats from '$comp/stats/garden/garden-stats.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { createPreview } from '../discord-preview';

	let overflow = $state(true);

	const ctx = getStatsContext();
</script>

<StatsHead
	discordPreview={createPreview(
		{ account: ctx.account, profile: ctx.selectedProfile, member: ctx.member.current, ranks: ctx.allRanks },
		page.url
	)}
	title="Garden"
	description="See this player's garden stats in Hypixel Skyblock!"
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/garden"
/>

<div class="flex w-full flex-col items-center justify-center gap-8">
	<section class="flex w-full flex-row items-center justify-center gap-4 px-2">
		<Skillbar skill="garden" {overflow} />
	</section>

	<section class="flex w-full justify-center align-middle">
		<div class="mx-2 flex w-full max-w-7xl flex-col justify-center gap-12 align-middle md:gap-8 lg:flex-row">
			<Milestones bind:overflow />
			<div class="flex flex-1 flex-col items-center gap-4 md:items-start">
				<div class="mt-2 flex max-w-full flex-wrap gap-6">
					<div class="flex flex-row gap-2">
						<Plots />
						<GardenStats />
					</div>

					<CropUpgrades />
				</div>

				<VisitorList />

				<MissingVisitors />
			</div>
		</div>
	</section>

	<Greenhouse />

	<GardenChips />

	<ComposterUpgrades />

	<div class="mx-4 mt-16 flex max-w-lg flex-col justify-center gap-1 rounded-md bg-background p-3 text-foreground">
		<h5 class="text-center text-lg font-semibold">Garden Disclaimer</h5>
		<p class="text-left">
			All garden data besides copper is shared between profile members due to how Hypixel made the system. This
			means there's no way to know how much each member contributed to the garden.
		</p>
	</div>
</div>
