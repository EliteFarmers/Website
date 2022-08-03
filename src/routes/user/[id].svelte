<script context="module" lang="ts">
	import type { Load } from './__types/[id]';

	export const load: Load = async ({ params, fetch }) => {
		const url = `/api/user/${params.id}`;
		const response = await fetch(url);

		return {
			status: response.status,
			props: {
				data: response.ok && (await response.json())
			}
		};
	}
</script>


<script lang="ts">
	import { onMount } from "svelte/internal";
	import { page } from "$app/stores";
	import type { ProfileData } from "$lib/skyblock";
	import Skills from "$comp/stats/skills.svelte";
	import Inventory from "$comp/stats/inventory.svelte";

	export let data: {
		account: {
			id: string;
			name: string;
			properties: { name: string, value: string }[]
		},
		profiles: ProfileData[],
		player: any;
	}

	const { account, profiles, player } = data;
	const { id: uuid, name: ign, properties } = account;

	onMount(async () => {
		if (ign !== $page.params.id) history.replaceState(history.state, document.title, ign);

		console.log({account});
		console.log({profiles});
		console.log({player});
	});
</script>

<svelte:head>
	<title>{ign}'s Stats</title>
</svelte:head>

<Skills member={profiles[3].members[uuid]} />

<!-- <Inventory itemstacks={profiles[3].members[uuid].inv_armor.data.value} /> -->

<h1 class="text-center m-16">{uuid} {ign} {profiles} {properties} {player}</h1>
