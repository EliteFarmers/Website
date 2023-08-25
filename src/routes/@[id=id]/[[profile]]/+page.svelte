<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';

	import Skills from '$comp/stats/skills.svelte';
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import Collections from '$comp/stats/collections.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import Breakdown from '$comp/stats/breakdown.svelte';
	import JacobInfo from '$comp/stats/jacob/jacobinfo.svelte';
	import Head from '$comp/head.svelte';

	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import Farmingtools from '$comp/items/tools/farmingtools.svelte';

	export let data: PageData;

	$: uuid = data.account.id;
	$: ign = data.account.name;

	$: profileDetails = data.profiles;
	$: player = data.account.playerData;
	$: collections = data.collections;

	$: weightRank = data.ranks?.misc?.farmingweight ?? -1;

	$: profileName = data.profile.profileName;
	$: profile = data.profile;

	$: member = data.member;

	$: farmingXp = getLevelProgress(
		'farming',
		member.skills?.farming ?? 0,
		(member.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
	);
	$: showSkills = $page.url.href.includes('#Skills');

	$: {
		if (browser) {
			const url = `/@${ign}/${profileName}`;
			if ($page.url.pathname !== url) {
				history.replaceState(history.state, document.title, url + ($page.url.hash ?? ''));
			}
		}
	}

	$: weightStr =
		member.farmingWeight?.totalWeight?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ??
		"hasn't loaded their";
	$: description = `${ign} has ${weightStr} Farming Weight${
		weightRank > 0 ? `, earning rank #${weightRank} in the world!` : '!'
	} View the site to see full information.`;
</script>

<Head title={ign + ' | Farming Weight'} {description}>
	<link rel="preload" href="/images/cropatlas.webp" as="image" />
</Head>

<main class="m-0 p-0 w-full">
	<PlayerInfo
		{player}
		members={profile.members?.filter((m) => m.uuid !== uuid)}
		{profileDetails}
		linked={data.account.discordUsername ?? null}
		weightInfo={member.farmingWeight}
		{weightRank}
		skyblockXP={member.skyblockXp ?? 0}
		skyblockRank={data.ranks?.misc?.skyblockxp ?? -1}
	/>

	<APIstatus api={member.api} />

	<section class="flex items-center justify-center w-full my-4 mb-12">
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
		<div class="flex justify-center w-full pb-4" transition:slide={{ duration: 1000, easing: quadInOut }}>
			<div class="w-[90%]">
				<Skills skills={member.skills} skillRanks={data.ranks?.skills} />
			</div>
		</div>
	{/if}

	<section class="flex w-full justify-center align-middle">
		<div class="flex flex-col lg:flex-row gap-8 max-w-7xl w-full justify-center align-middle mx-2">
			<Collections {collections} ranks={data.ranks?.collections} />
			<Farmingtools tools={member.farmingWeight?.inventory?.tools ?? []} />
		</div>
	</section>

	<JacobInfo
		jacob={member.jacob}
		ign={data.account.name ?? ''}
		ranks={{
			gold: data.ranks?.misc?.goldmedals ?? -1,
			silver: data.ranks?.misc?.silvermedals ?? -1,
			bronze: data.ranks?.misc?.bronzemedals ?? -1,
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
</main>
