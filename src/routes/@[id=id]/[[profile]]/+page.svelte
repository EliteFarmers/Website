<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { LotusGear } from 'farming-weight';

	import Skills from '$comp/stats/skills.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import Collections from '$comp/stats/collections.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import Breakdown from '$comp/stats/breakdown.svelte';
	import JacobInfo from '$comp/stats/jacob/jacobinfo.svelte';
	import Farmingtools from '$comp/items/tools/farmingtools.svelte';
	import Lotusgear from '$comp/rates/lotusgear.svelte';
	import Head from '$comp/head.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

	$: uuid = data.account.id;
	$: ign = data.account.name;
	$: collections = data.collections;
	$: weightRank = data.ranks?.misc?.farmingweight ?? -1;
	$: profile = data.profile;
	$: member = data.member;

	$: farmingXp = getLevelProgress(
		'farming',
		member.skills?.farming ?? 0,
		(member.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
	);
	$: showSkills = $page.url.href.includes('#Skills');

	$: weightStr =
		member.farmingWeight?.totalWeight?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ??
		"hasn't loaded their";
	$: description = `${ign} has ${weightStr} Farming Weight${
		weightRank > 0 ? `, earning rank #${weightRank} in the world!` : '!'
	} View the site to see full information.`;

	$: lotus = (data.member?.farmingWeight?.inventory?.equipment ?? [])
		.filter((t) => LotusGear.isValid(t))
		.map((t) => new LotusGear(t));
</script>

<Head title={ign + ' | Farming Weight'} {description}>
	<link rel="preload" href="/images/cropatlas.webp" as="image" />
</Head>

<APIstatus api={member.api} />

<section class="flex items-center justify-center w-full mt-2 mb-20">
	<div class="flex w-[90%] lg:w-2/3 align-middle justify-center justify-self-center mx-2">
		<div class="w-[90%]">
			<Skillbar name="Farming" progress={farmingXp} rank={data.ranks?.skills?.farming} />
		</div>
		<div class="w-[10%]">
			<!-- Collapse/expand button -->
			<button
				class="flex justify-center align-middle items-center w-full lg:h-16 h-full lg:p-4 bg-gray-200 dark:bg-zinc-800 rounded-lg"
				on:click={() => {
					showSkills = !showSkills;
				}}
			>
				<svg class="w-6 h-6 lg:w-full lg:h-full" viewBox="0 0 24 24">
					{#if showSkills}
						<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
					{:else}
						<path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
					{/if}
				</svg>
			</button>
		</div>
	</div>
</section>

{#if showSkills}
	<div class="flex justify-center w-full mb-4 -mt-8" transition:slide={{ duration: 1000, easing: quadInOut }}>
		<div class="block w-[90%] mb-4">
			<Skills skills={member.skills} skillRanks={data.ranks?.skills} />
		</div>
	</div>
{/if}

<section class="flex w-full justify-center align-middle my-8">
	<div class="flex flex-col lg:flex-row gap-8 max-w-7xl w-full justify-center align-middle mx-2">
		<Collections {collections} ranks={data.ranks?.collections} />
		<div class="flex flex-1 flex-col gap-4">
			<Lotusgear items={lotus} />
			<Farmingtools tools={member.farmingWeight?.inventory?.tools ?? []} />
		</div>
	</div>
</section>

<JacobInfo
	jacob={member.jacob}
	ign={data.account.name ?? ''}
	ranks={{
		gold: data.ranks?.misc?.goldmedals ?? -1,
		silver: data.ranks?.misc?.silvermedals ?? -1,
		bronze: data.ranks?.misc?.bronzemedals ?? -1,
		platinum: data.ranks?.misc?.platinummedals ?? -1,
		diamond: data.ranks?.misc?.diamondmedals ?? -1,
		participations: data.ranks?.misc?.participations ?? -1,
		firstPlaces: data.ranks?.misc?.firstplace ?? -1,
	}}
/>

<Breakdown weight={member.farmingWeight} />

<div class="text-center text-md my-16 flex flex-col justify-center w-full">
	<p>
		<span class="select-none text-gray-500">Player UUID:</span>
		<span class="select-all">{uuid}</span>
	</p>
	<p>
		<span class="select-none text-gray-500">Profile UUID:</span>
		<span class="select-all">{profile.profileId}</span>
	</p>
	<p>
		<span class="select-none text-gray-500">Last Updated:</span>
		{new Date((member?.lastUpdated ?? 0) * 1000).toLocaleString()}
	</p>
</div>
