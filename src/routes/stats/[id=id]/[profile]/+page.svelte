<script lang="ts">
	import { onMount } from 'svelte/internal';
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

	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	export let data: PageData;

	const account = data.account;
	const profileIds = data.profiles;
	const player = data.player;
	const collections = data.collections;
	const { id: uuid, name: ign } = account;

	const weightRank = data.rankings?.weight?.farming ?? -1;

	let profileName = data.profileName;
	let profile = data.profile;

	const farmingXp = getLevelProgress(
		'farming',
		profile.member.skills?.farming ?? 0,
		(profile.member.jacob?.perks?.farming_level_cap ?? 0) + DEFAULT_SKILL_CAPS.farming
	);
	let showSkills = $page.url.href.includes('#Skills');

	onMount(async () => {
		const url = `/stats/${ign}/${profileName}`;
		if ($page.url.pathname !== url) {
			history.replaceState(history.state, document.title, url + ($page.url.hash ?? ''));
		}
	});

	const weightStr =
		data.weight?.farming?.total?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "hasn't loaded their";
	const description = `${ign} has ${weightStr} Farming Weight${
		weightRank > 0 ? `, earning rank #${weightRank} in the world!` : '!'
	} View the site to see full information.`;
</script>

<Head title={ign + ' | Farming Weight'} {description}>
	<link rel="preload" href="/images/cropatlas.png" as="image" />
</Head>

<main class="m-0 p-0 w-full">
	<PlayerInfo
		{account}
		{player}
		members={profile.members}
		{profileIds}
		linked={data.user.linked}
		weightInfo={data.weight}
		{weightRank}
		skyblockXP={profile.member.leveling?.experience ?? 0}
	/>

	<APIstatus api={profile.api} />

	<section class="flex items-center justify-center w-full py-4">
		<div class="flex w-[90%] lg:w-2/3 align-middle justify-center justify-self-center mx-2">
			<div class="w-[90%]">
				<Skillbar name="Farming" progress={farmingXp} rank={data.rankings?.skills?.farming} />
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
				<Skills member={profile?.member} skillRanks={data.rankings.skills} />
			</div>
		</div>
	{/if}

	<Collections {collections} ranks={data.rankings.crops} />

	<JacobInfo jacob={profile.member.jacob} ign={account.name} />

	<Breakdown weight={data.weight?.farming} />
</main>

<h1 class="text-center text-md m-16 flex flex-col">
	<span>
		<span class="select-none text-gray-500">Player UUID:</span>
		{uuid}
	</span>
	<span>
		<span class="select-none text-gray-500">Last Loaded:</span>
		{new Date(data.last_fetched).toLocaleString()}
	</span>
</h1>
