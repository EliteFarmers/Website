<script lang="ts">
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import Milestones from '$comp/stats/garden/milestones.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import { GARDEN_VISITORS, getGardenLevel } from 'farming-weight';
	import type { components } from '$lib/api/api';
	import Plots from '$comp/stats/garden/plots.svelte';
	import CropUpgrades from '$comp/stats/garden/crop-upgrades.svelte';
	import VisitorList from '$comp/stats/garden/visitor-list.svelte';
	import MissingVisitors from '$comp/stats/garden/missing-visitors.svelte';
	import { page } from '$app/stores';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let overflow = $state(true);

	let garden = $derived((data.member.garden ?? {}) as components['schemas']['GardenDto']);
	let maxVisitors = $derived(Object.keys(GARDEN_VISITORS).length);
	let totalVisits = $derived(
		Object.values(garden.visitors ?? {}).reduce((acc, { visits = 0 }) => acc + visits, 0) ?? 0
	);
	let accepted = $derived(garden.completedVisitors ?? 0);
	let rejected = $derived(totalVisits - accepted);
	let rate = $derived(((accepted / totalVisits) * 100).toFixed(2));
	let ranks = $derived(data.ranks?.profile ?? {});
</script>

<Head title="{data.account.name} | Garden" description="See this player's garden stats in Hypixel Skyblock!" />

<div class="flex w-full flex-col items-center justify-center gap-8">
	<section class="flex w-full flex-row items-center justify-center gap-4 px-2">
		<Skillbar name="Garden" progress={getGardenLevel(garden.experience ?? 0, overflow)} rank={ranks.garden} />
	</section>

	<section class="flex w-full justify-center align-middle">
		<div class="mx-2 flex w-full max-w-7xl flex-col justify-center gap-12 align-middle md:gap-8 lg:flex-row">
			<Milestones garden={data.member.garden} bind:overflow {ranks} />
			<div class="flex flex-1 flex-col items-center gap-4 md:items-start">
				<div class="mt-2 flex flex-row gap-6">
					<div class="flex flex-col gap-2">
						<h3 class="text-lg font-semibold leading-none">Unlocked Plots</h3>
						<Plots plots={garden.plots} />
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-lg font-semibold leading-none">Crop Upgrades</h3>
						<CropUpgrades {garden} />
					</div>
				</div>

				<div class="flex flex-col gap-2 text-lg">
					<div class="flex flex-row items-center gap-1 rounded-md bg-primary-foreground p-1 px-2">
						Copper • <span class="font-semibold"
							>{(data.member.unparsed?.copper ?? 0).toLocaleString()}</span
						>
					</div>
				</div>

				<div class="flex w-full flex-col gap-2">
					<h3 class="text-xl font-semibold leading-none">Visitors</h3>
					<div class="flex max-w-lg flex-wrap gap-2 text-lg sm:flex-row">
						<div class="flex flex-row items-center gap-1 rounded-md bg-primary-foreground p-1 px-2">
							Unique • <span class="font-semibold">{(garden.uniqueVisitors ?? 0).toLocaleString()}</span
							>/{maxVisitors}
						</div>
						<div class="flex flex-row items-center gap-1 rounded-md bg-primary-foreground p-1 px-2">
							Total Visits • <span class="font-semibold">{totalVisits.toLocaleString()}</span>
						</div>
						<div class="flex flex-row items-center gap-1 rounded-md bg-primary-foreground p-1 px-2">
							{#if ranks['visitors-accepted'] > 0}
								<a
									href="/leaderboard/visitors-accepted/{$page.params.id}-{$page.params.profile}"
									class="rounded-md bg-card px-1.5 hover:bg-muted"
								>
									<span class="text-sm">#</span><span class="text-md"
										>{ranks['visitors-accepted']}</span
									>
								</a> •
							{/if}
							Accepted • <span class="font-semibold">{accepted.toLocaleString()}</span>
						</div>
						<div class="flex flex-row items-center gap-1 rounded-md bg-primary-foreground p-1 px-2">
							Rejected • <span class="font-semibold">{rejected.toLocaleString()}</span>
						</div>
						<div class="flex flex-row items-center gap-1 rounded-md bg-primary-foreground p-1 px-2">
							Acceptance Rate • <span class="font-semibold">{rate}%</span>
						</div>
					</div>
					<VisitorList {garden} />
				</div>

				{#if (garden.uniqueVisitors ?? 0) < maxVisitors}
					<div class="flex w-full flex-col gap-2">
						<h3 class="text-xl font-semibold leading-none">Missing Visitors</h3>
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
