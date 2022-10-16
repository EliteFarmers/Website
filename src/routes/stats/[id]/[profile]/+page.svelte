<script lang="ts">
	import { onMount } from 'svelte/internal';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { FetchNewProfiles } from '$lib/util';

	import Skills from '$comp/stats/skills.svelte';
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import Weight from '$comp/stats/weight.svelte';
	import Collections from '$comp/stats/collections.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import Breakdown from '$comp/stats/breakdown.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

	const account = data.account;
	const profileIds = data.profiles;
	const player = data.player;
	const { id: uuid, name: ign, properties } = account;

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
		if ($page.url.pathname !== url)
			history.replaceState(history.state, document.title, url + ($page.url.hash ?? ''));

		// console.log(account);
		// console.log({ profiles });
		// console.log(data.weight);

		// If the data is old, fetch new data and update the page.
		FetchNewProfiles(uuid, data.last_fetched).then((data) => {
			if (!data) return;
			// profiles = data;
		});
	});
</script>

<svelte:head>
	<title>{ign}'s Stats</title>
	<!-- Preload image -->
	<link rel="preload" href="/images/cropatlas.png" as="image" />
</svelte:head>

<main class="m-0 p-0 w-full">
	<PlayerInfo {account} {player} members={profile.members} {profileIds} linked={data.user.linked}>
		<section class="flex justify-center lg:justify-start lg:pl-[20%] w-full">
			<Weight weightInfo={data.weight} />
		</section>
	</PlayerInfo>

	<APIstatus api={profile.api} />

	<section class="flex items-center justify-center w-full py-4">
		<div class="flex w-[90%] lg:w-2/3 align-middle justify-center justify-self-center mx-2">
			<div class="w-[90%]">
				<Skillbar name="Farming" progress={farmingXp} />
			</div>
			<div class="w-[10%]">
				<!-- Collapse/expand button -->
				<button
					class="flex justify-center align-middle items-center w-full lg:h-16 h-full lg:p-4 bg-gray-200 rounded-lg"
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
				<Skills member={profile?.member} />
			</div>
		</div>
	{/if}

	<Collections member={profile.member} weight={data.weight} />

	<Breakdown weight={data.weight.farming} />
</main>

<h1 id="Info" class="text-center text-body m-16">
	{uuid}
	{ign}
	{profile}
	{player?.player.socialMedia?.links?.DISCORD}
	{data.weight?.farming?.total}
</h1>
