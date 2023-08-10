<script lang="ts">
	import { Button, Checkbox, Radio } from 'flowbite-svelte';
	import type { ActionData, PageData } from './$types';
	import { page } from '$app/stores';

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
		<form method="post" action="?/join" class="flex flex-col gap-4 max-w-lg mb-16">
			<p>Choose the profile you want to join the event with.</p>

			{#each profiles as profile (profile)}
				<Radio name="profile" value={profile.profileId}>
					{profile.profileName} - {profile.members
						?.find((m) => m.uuid === data.account?.id)
						?.farmingWeight?.toLocaleString()} Farming Weight
				</Radio>
			{/each}

			<h3 class="mt-2 text-lg">How is progress counted?</h3>
			<p>
				To prevent the use of minions to gain collection progress, the event will only count progress made
				through the use of farming tools. <span class="text-red-500"
					>You must have collections and inventory API access enabled at all times.</span
				> If you do turn them off, you will be automatically removed from the event.
			</p>
			<p>
				Collection gain is cross checked with your tool usage. If you gain collection progress without using a
				tool, it will not count towards your progress. <span class="text-red-500"
					>If you remove a tool from one of your inventories during the event, all collection gained from its
					use will be wiped from your score.</span
				>
				It is safe to move tools between inventories (e.g. from your inventory to your ender chest) as long as you
				do not remove them from your inventories (by placing them in a chest on your island, trading them to another
				player, voiding it, etc). New tools can be added to your inventories at any time.
			</p>
			<p class="text-red-500">
				Tools that do not have a built in counter require the Cultivating enchantment or your progress with that
				tool will not be counted.
			</p>
			<p class="text-gray-500">
				The only valid tools are the specific farming tools. Normal hoes and other beginner tools will not
				count.
			</p>

			<Checkbox name="confirm" value="true" class="mt-8" required>
				I confirm that I have read all of <a
					href="https://hypixel.net/rules"
					class="underline text-blue-500 mx-1"
				>
					Hypixel's Server Rules
				</a> and that I agree to them.
			</Checkbox>

			<Checkbox name="confirm" value="true" required>
				I confirm that I have read the event's rules and that I agree to them.
			</Checkbox>

			<Checkbox name="confirm" value="true" required>
				I confirm that I have read the rules of the related Discord Server and that I agree to them.
			</Checkbox>

			<Checkbox name="confirm" value="true" required>
				I understand that this website does not act as a middleman nor is responsible for distributing prizes.
			</Checkbox>

			<Checkbox name="confirm" value="true" required>
				I understand that I may be removed from the event at any time for breaking any rules, or appearing to
				break them at the discretion of the event moderators.
			</Checkbox>

			<div class="flex flex-col md:flex-row gap-8 justify-center">
				<Button class="flex-1" href="/event/{$page.params.event}" color="alternative">Go Back</Button>
				<Button class="flex-1" type="submit">Join</Button>
			</div>

			{#if form?.error}
				<h5 class="text-xl font-semibold text-red-700">
					<p>{form?.error}</p>
				</h5>
			{/if}
		</form>

		<form method="post" action="?/leave" class="my-8 mb-16 max-w-xl">
			<div class="flex flex-row gap-2 items-center justify-center">
				<p>Already joined?</p>
				<Button type="submit" color="alternative" size="xs">Leave Event</Button>
			</div>
			<p class="mt-2 text-center">
				Leaving the event will remove you from the leaderboard. Be sure you want to leave before doing so. There
				is no confirmation.
			</p>
		</form>
	{/if}
</main>
