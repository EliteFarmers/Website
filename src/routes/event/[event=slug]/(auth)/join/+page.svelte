<script lang="ts">
	import { Button, Radio } from 'flowbite-svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: profiles =
		data.account?.profiles?.filter((p) => p.members?.some((m) => m.active && m.uuid === data.account?.id)) ?? [];
</script>

<main class="flex flex-col justify-center items-center gap-4">
	<h1 class="my-16 text-4xl font-semibold">Join Event</h1>

	{#if !data.account}
		<p>You have no Minecraft accounts linked to your account.</p>
		<p>Link your Minecraft account <a href="/profile" class="text-blue-500">here</a> first.</p>
	{:else}
		<form method="post" action="?/join" class="flex flex-col gap-4">
			<p>Choose the profile you want to join the event with.</p>

			{#each profiles as profile (profile)}
				<Radio name="profile" value={profile.profileId}>
					{profile.profileName} - {profile.members
						?.find((m) => m.uuid === data.account?.id)
						?.farmingWeight?.toLocaleString()} Farming Weight
				</Radio>
			{/each}

			<Button type="submit">Join</Button>
		</form>
	{/if}

	{#if form?.error}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.error}</p>
		</h5>
	{/if}
</main>
