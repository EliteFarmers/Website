<script lang="ts">
	import Head from '$comp/head.svelte';
	import Milestones from '$comp/stats/garden/milestones.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import { Crop, GARDEN_VISITORS, getCropDisplayName, getCropUpgrades, getGardenLevel } from 'farming-weight';
	import type { components } from '$lib/api/api';
	import Plots from '$comp/stats/garden/plots.svelte';
	import CropUpgrades from '$comp/stats/garden/crop-upgrades.svelte';
	import ComposterUpgrades from '$comp/stats/garden/composter-upgrades.svelte';
	import VisitorList from '$comp/stats/garden/visitor-list.svelte';
	import MissingVisitors from '$comp/stats/garden/missing-visitors.svelte';
	import { page } from '$app/state';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Popover from '$ui/popover';
	import { CROP_UPGRADES_MAX_COST, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getCopperSpentCropUpgrades } from '$lib/calc/garden';

	let overflow = $state(true);

	const ctx = getStatsContext();
	const garden = $derived((ctx.member.garden ?? {}) as components['schemas']['GardenDto']);

	const maxVisitors = $derived(Object.keys(GARDEN_VISITORS).length);
	const totalVisits = $derived(
		Object.values(garden.visitors ?? {}).reduce((acc, { visits = 0 }) => acc + visits, 0) ?? 0
	);
	const accepted = $derived(garden.completedVisitors ?? 0);
	const rejected = $derived(totalVisits - accepted);
	const rate = $derived(((accepted / totalVisits) * 100).toFixed(2));
	const ranks = $derived(ctx.ranks);

	const copper = $derived(ctx.member.unparsed?.copper ?? 0);

	let upgrades = $derived(getCropUpgrades(garden?.cropUpgrades ?? {}));
	let crops = $derived(
		Object.entries(upgrades)
			.map(([crop, level]) => {
				const name = getCropDisplayName(crop as Crop);
				const img = PROPER_CROP_TO_IMG[name as keyof typeof PROPER_CROP_TO_IMG];

				return { name, img, level };
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let totalCopperSpent = $derived.by(() =>
		crops.reduce((sum, { level }) => sum + getCopperSpentCropUpgrades(level), 0)
	);
</script>

<Head title="{ctx.ignMeta} | Garden" description="See this player's garden stats in Hypixel Skyblock!" />

<div class="flex w-full flex-col items-center justify-center gap-8">
	<section class="flex w-full flex-row items-center justify-center gap-4 px-2">
		<Skillbar name="Garden" progress={getGardenLevel(garden.experience ?? 0, overflow)} rank={ranks.garden?.rank} />
	</section>

	<section class="flex w-full justify-center align-middle">
		<div class="mx-2 flex w-full max-w-7xl flex-col justify-center gap-12 align-middle md:gap-8 lg:flex-row">
			<Milestones {garden} bind:overflow {ranks} />
			<div class="flex flex-1 flex-col items-center gap-4 md:items-start">
				<div class="mt-2 flex flex-row gap-6">
					<div class="flex flex-col gap-2">
						<h3 class="text-lg leading-none font-semibold">Unlocked Plots</h3>
						<Plots plots={garden.plots} />
					</div>
					<div class="-mt-0.5 flex flex-col">
						<Popover.Mobile triggerRootClass="inline-block w-fit">
							{#snippet trigger()}
								<h3 class="text-lg leading-none font-semibold">Crop Upgrades</h3>
							{/snippet}
							<div class="flex flex-col gap-1">
								<p class="font-semibold">All Crops</p>
								<p class="max-w-xs break-words whitespace-normal">
									<span class="font-semibold">{totalCopperSpent.toLocaleString()}</span> Total Copper
									Spent <br />
								</p>
								<p class="max-w-xs break-words whitespace-normal">
									<span class="font-semibold"
										>{(CROP_UPGRADES_MAX_COST - totalCopperSpent).toLocaleString()}</span
									> Total Copper Until Max
								</p>
							</div>
						</Popover.Mobile>
						<CropUpgrades {garden} />
					</div>
				</div>

				<div class="-mt-0.5 flex flex-col">
					<Popover.Mobile triggerRootClass="inline-block w-fit">
						{#snippet trigger()}
							<h3 class="mb-4 mt-2 text-lg font-semibold leading-none">Composter Upgrades</h3>
						{/snippet}
						<div class="flex flex-col gap-1">
							<p class="font-semibold">All Upgrades</p>
							<!-- total resources used so far -->
						</div>
					</Popover.Mobile>
					<ComposterUpgrades {garden} />
				</div>

				<div class="flex flex-col gap-2 text-lg">
					<div class="bg-card flex flex-row items-center gap-1 rounded-md p-1 px-2">
						Copper • <span class="font-semibold">{copper.toLocaleString()}</span>
					</div>
				</div>

				<div class="flex w-full flex-col gap-2">
					<h3 class="text-xl leading-none font-semibold">Visitors</h3>
					<div class="flex max-w-lg flex-wrap gap-2 text-lg sm:flex-row">
						<div class="bg-card flex flex-row items-center gap-1 rounded-md p-1 px-2">
							Unique • <span class="font-semibold">{(garden.uniqueVisitors ?? 0).toLocaleString()}</span
							>/{maxVisitors}
						</div>
						<div class="bg-card flex flex-row items-center gap-1 rounded-md p-1 px-2">
							Total Visits • <span class="font-semibold">{totalVisits.toLocaleString()}</span>
						</div>
						<div class="bg-card flex flex-row items-center gap-1 rounded-md p-1 px-2">
							{#if ranks['visitors-accepted']?.rank > 0}
								<a
									href="/leaderboard/visitors-accepted/{page.params.id}-{page.params.profile}"
									class="bg-card hover:bg-muted rounded-md px-1.5"
								>
									<span class="text-sm">#</span><span class="text-md"
										>{ranks['visitors-accepted']?.rank}</span
									>
								</a> •
							{/if}
							Accepted • <span class="font-semibold">{accepted.toLocaleString()}</span>
						</div>
						<div class="bg-card flex flex-row items-center gap-1 rounded-md p-1 px-2">
							Rejected • <span class="font-semibold">{rejected.toLocaleString()}</span>
						</div>
						<div class="bg-card flex flex-row items-center gap-1 rounded-md p-1 px-2">
							Acceptance Rate • <span class="font-semibold">{rate}%</span>
						</div>
					</div>
					<VisitorList {garden} />
				</div>

				{#if (garden.uniqueVisitors ?? 0) < maxVisitors}
					<div class="flex w-full flex-col gap-2">
						<h3 class="text-xl leading-none font-semibold">Missing Visitors</h3>
						<MissingVisitors {garden} />
					</div>
				{/if}
			</div>
		</div>
	</section>

	<div class="mx-4 mt-16 flex max-w-lg flex-col justify-center gap-1">
		<h5 class="text-center text-lg font-semibold">Garden Disclaimer</h5>
		<p class="text-left">
			All garden data besides copper is shared between profile members due to how Hypixel made the system. This
			means there's no way to know how much each member contributed to the garden.
		</p>
	</div>
</div>
