<script lang="ts">
	import type { AccountData, AccountInfo, PlayerInfo, ProfileData, Profiles } from "$lib/skyblock";
	import type { DiscordUser } from '$db/models/users';
	import type { PageData } from './$types';
	import { onMount } from "svelte/internal";
	import { page } from "$app/stores";

	import Skills from "$comp/stats/skills.svelte";
	import { error } from "@sveltejs/kit";

	export let data: PageData;

	const account = data.account;
	const profiles = data.profiles;
	const player = data.player;
	const { id: uuid, name: ign, properties } = account;


	let profileName = data.profileName;

	let selectedProfile = profiles.profiles.find((p) => p.cute_name.toUpperCase() === profileName.toUpperCase());

	if (!selectedProfile && profiles.profiles.length > 0) {
		const recentProfile = profiles.profiles.sort((a, b) => b.member.last_save - a.member.last_save)[0];
		profileName = recentProfile.cute_name;
		selectedProfile = recentProfile;
	}

	const profile = selectedProfile;

	if (!profile) {
		throw error(404, `Profile ${profileName} not found`);
	}

	onMount(async () => {
		// if (ign !== $page.params.id) history.replaceState(history.state, document.title, ign);
		if (profileName !== $page.params.profile) history.replaceState(history.state, document.title, profileName);

		// console.log(account);
		// console.log({ profiles });
		console.log({ player });
	});
</script>

<svelte:head>
	<title>{ign}'s Stats</title>
</svelte:head>

<Skills member={profile.member} />

<h1 class="text-center m-16">{uuid} {ign} {profile} {player?.player.socialMedia?.links?.DISCORD}</h1>

