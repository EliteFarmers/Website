<script lang="ts">
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import Milestones from '$comp/stats/garden/milestones.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import { getGardenLevel } from 'farming-weight';
	import type { components } from '$lib/api/api';
	import Plots from '$comp/stats/garden/plots.svelte';

	export let data: PageData;
	let overflow = true;

	$: garden = (data.member.garden ?? {}) as components['schemas']['GardenDto'];
</script>

<Head title="{data.account.name} | Garden" description="See this player's garden stats in Hypixel Skyblock!" />

<div class="flex flex-col justify-center items-center w-full gap-4">
	<section class="flex flex-row items-center justify-center w-full gap-4 px-2">
		<Skillbar name="Garden" progress={getGardenLevel(garden.experience ?? 0)} />
	</section>

	<section class="flex w-full justify-center align-middle my-8">
		<div class="flex flex-col lg:flex-row gap-8 max-w-7xl w-full justify-center align-middle mx-2">
			<Milestones garden={data.member.garden} {overflow} />
			<div class="flex flex-1 flex-col gap-2">
				<Plots plots={garden.plots} />
				<div>
					{JSON.stringify(garden.visitors)}
				</div>
			</div>
		</div>
	</section>

	<div class="flex flex-col justify-center max-w-lg gap-1 mx-4 mt-16">
		<h5 class="text-lg font-semibold text-center">Garden Disclaimer</h5>
		<p class="text-left">
			All garden data is shared between profile members due to how Hypixel made the system. This means there's no
			way to know how much each member contributed to the garden.
		</p>
	</div>
</div>
