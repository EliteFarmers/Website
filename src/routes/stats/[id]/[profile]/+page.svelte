<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from "svelte/internal";
	import { page } from "$app/stores";
	import { error } from "@sveltejs/kit";
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';

	import Skills from "$comp/stats/skills.svelte";
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';

	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import { PROFILE_UPDATE_INTERVAL } from "$lib/constants/data";
	import { PUBLIC_HOST_URL } from "$env/static/public";

	export let data: PageData;

	const account = data.account;
	let profiles = data.profiles;
	const player = data.player;
	const { id: uuid, name: ign, properties } = account;

	let profileName = data.profileName;

	$: selectedProfile = profiles.profiles.find((p) => p.cute_name.toUpperCase() === profileName.toUpperCase());

	if (!selectedProfile && profiles.profiles.length > 0) {
		const recentProfile = profiles.profiles.sort((a, b) => b.member.last_save - a.member.last_save)[0];
		profileName = recentProfile.cute_name;
		selectedProfile = recentProfile;
	}

	let profile = selectedProfile;

	if (!profile) {
		throw error(404, `Profile ${profileName} not found`);
	}

	const farmingXp = getLevelProgress('farming', profile.member.skills?.farming ?? 0, (profile.member.jacob?.perks?.farming_level_cap ?? 0) + DEFAULT_SKILL_CAPS.farming);
	let showSkills = $page.url.href.includes('#Skills');

	onMount(async () => {
		// if (ign !== $page.params.id) history.replaceState(history.state, document.title, ign);
		if (profileName !== $page.params.profile) history.replaceState(history.state, document.title, profileName);

		// console.log(account);
		// console.log({ profiles });
		console.log({ player });

		// If the data is old, fetch new data and update the page.
		if ((Date.now() - profiles.last_fetched) > PROFILE_UPDATE_INTERVAL) {
			setTimeout(() => {
				fetch(`${PUBLIC_HOST_URL}/api/profiles/${uuid}`).then((res) => {
					if (res.status !== 200) {
						return;
					}
					res.json().then((data) => {
						console.log('Fetched new profiles');
						if (data.success) profiles = data;
					});
				}).catch((err) => {
					console.log(err);
				});
			}, 2000);
		}
	});
</script>

<svelte:head>
	<title>{ign}'s Stats</title>
</svelte:head>

<PlayerInfo account={account} player={player}>
	<div class="flex md:justify-start md:w-1/2">
		<div class="w-[90%]">
			<Skillbar name="Farming" progress={farmingXp} />
		</div>
		<div class="w-[10%]">
			<!-- Collapse/expand button -->
			<button class="flex justify-center align-middle items-center w-full md:h-16 h-full md:p-4 bg-gray-200 rounded-lg" on:click={() => { showSkills = !showSkills }}>
				<svg class="w-6 h-6 md:w-full md:h-full" viewBox="0 0 24 24">
					{#if showSkills}
						<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
					{:else}
						<path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
					{/if}
				</svg>
			</button>
		</div>
	</div>
</PlayerInfo>

{#if showSkills}
	<div class="flex justify-center w-full" transition:slide={{ duration: 1000, easing: quadInOut }}>
		<div class="w-[90%]">
			<Skills member={profile.member} />
		</div>
	</div>
{/if}



<!-- <Skills member={profile.member} /> -->

<h1 id="Info" class="text-center m-16">{uuid} {ign} {profile} {player?.player.socialMedia?.links?.DISCORD}</h1>

