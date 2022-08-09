<script context="module" lang="ts">
	import type { Load } from './__types/[profile]';

	export const load: Load = async ({ params, fetch, session }) => {
		const accountRes = await fetch(`/api/account/${params.id}`);
		const { account }: AccountInfo = await accountRes.json();

		const profilesFetch = fetch(`/api/profiles/${account.id}`);
		const playerFetch = fetch(`/api/player/${account.id}`);

		try {
			const [ profilesRes, playerRes ] = await Promise.all([ profilesFetch, playerFetch ]);
			const [ profiles, player ] = await Promise.all([ profilesRes.json(), playerRes.json() ]);

			return {
				status: 200,
				props: {
					/* discordUser: session.discordUser, 
					user: session.user, */
					account: account,
					profiles: profiles,
					player: player,
					profileName: params.profile
				}
			}
		} catch (err) {
			console.log(err);
			return {
				status: 404,
			};
		}
	}
</script>


<script lang="ts">
	import type { AccountData, AccountInfo, PlayerInfo, ProfileData, Profiles } from "$lib/skyblock";
	import type { DiscordUser } from '$db/models/users';
	import { onMount } from "svelte/internal";
	import { page } from "$app/stores";

	import Skills from "$comp/stats/skills.svelte";

	// export let discordUser: DiscordUser | false;
	// export let user: User | false;

	export let account: AccountData;
	export let profiles: Profiles;
	export let player: PlayerInfo;

	export let profileName: string;

	const { id: uuid, name: ign, properties } = account;

	let selectedProfile = profiles.profiles.find((p) => p.cute_name.toUpperCase() === profileName.toUpperCase());

	if (!selectedProfile) {
		selectedProfile = profiles.profiles?.sort((a, b) => b.member.last_save - a.member.last_save)?.[0];
		profileName = selectedProfile?.cute_name;
	}

	const profile = selectedProfile;

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

