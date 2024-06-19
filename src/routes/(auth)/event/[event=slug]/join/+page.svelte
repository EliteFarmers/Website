<script lang="ts">
	import { Button } from '$ui/button';
	import * as Checkbox from '$ui/checkbox';
	import { Label } from '$ui/label';
	import type { ActionData, PageData } from './$types';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { EventType } from '$lib/utils';
	import { Input } from '$ui/input';
	import { SelectSimple } from '$ui/select';

	export let data: PageData;
	export let form: ActionData;
	let checks = {
		1: false,
		2: false,
		3: false,
		4: false,
	};

	$: event = data.event;
	$: teams = (data.teams ?? [])
		.filter((t) => t.members && event && event.maxTeamMembers && (t.members?.length < event.maxTeamMembers || event.maxTeamMembers === -1))
		.map((t) => ({ 
			value: t.id ?? '', 
			label: (t.name ?? '') + ` (${t.members?.length}${event?.maxTeamMembers === -1 ? '' : `/${event?.maxTeamMembers}`})`, 
		}));

	$: joined = data.member && data.member?.status !== 1 && data.member?.status !== 2;
	$: ownTeamId = +(data.member?.teamId ?? '0');
	$: ownTeam = data.teams?.find(t => t.id === ownTeamId);

	$: profiles =
		data.account?.profiles?.filter((p) => p.members?.some((m) => m.active && m.uuid === data.account?.id)) ?? [];
</script>

<main class="flex flex-col justify-center items-center gap-4">
	<h1 class="my-16 text-4xl font-semibold">Join Event</h1>

	{#if !data.account}
		<p>You have no Minecraft accounts linked to your account.</p>
		<p>Link your Minecraft account <a href="/profile" class="text-blue-500">here</a> first.</p>
	{:else}
		<form method="post" action="?/join" class="flex flex-col gap-4 max-w-lg mb-16" use:enhance>
			<p>Choose the profile you want to join the event with.</p>

			{#each profiles as profile (profile)}
				<div class="flex flex-row gap-2 items-center">
					<input type="radio" name="profile" value={profile.profileId} required class="w-4 h-4" />
					<p>
						{profile.profileName} - {profile.members
							?.find((m) => m.uuid === data.account?.id)
							?.farmingWeight?.toLocaleString()} Farming Weight
					</p>
				</div>
			{/each}

			<h3 class="mt-2 text-lg">How is progress counted?</h3>
			{#if data.event.type === +EventType.FarmingWeight}
				<p>
					To prevent the use of minions to gain collection progress, the event will only count progress made
					through the use of farming tools. <span class="text-red-500"
						>You must have collections and inventory API access enabled at all times.</span
					> If you do turn them off, you will be automatically removed from the event.
				</p>
				<p>
					Collection gain is cross checked with your tool usage. If you gain collection progress without using
					a tool, it will not count towards your progress. This also means a Daedalus Axe won't count either,
					as there's no way to differentiate it from minions.
				</p>
				<p class="text-red-500">
					Tools that do not have a built in counter require the Cultivating enchantment or your progress with
					that tool will not be counted.
				</p>
				<p class="text-gray-500">
					The only valid tools are the specific farming tools. Normal hoes and other beginner tools will not
					count.
				</p>
			{:else if data.event.type === +EventType.Medals}
				<p>
					It's simple, just earn Jacob Contest placements! Make sure to claim your contests in game for them
					to count.
				</p>
			{/if}

			<div class="flex gap-2 items-center mt-8">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[1]} />
				<Checkbox.Root bind:checked={checks[1]} />
				<Label>
					I confirm that I have read all of <a
						href="https://hypixel.net/rules"
						class="underline text-blue-500"
					>
						Hypixel's Server Rules
					</a> and that I agree to them.
				</Label>
			</div>

			<div class="flex gap-2 items-center">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[2]} />
				<Checkbox.Root bind:checked={checks[2]} />
				<Label>I confirm that I have read the event's rules and disclaimers and that I agree to them.</Label>
			</div>

			<div class="flex gap-2 items-center">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[3]} />
				<Checkbox.Root bind:checked={checks[3]} />
				<Label>
					I confirm that I have read the rules of the related Discord Server and that I agree to them.
				</Label>
			</div>

			<div class="flex gap-2 items-center mb-8">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[4]} />
				<Checkbox.Root bind:checked={checks[4]} />
				<Label>
					I understand that I may be removed from the event at any time for breaking any rules, or appearing
					to break them at the discretion of the event moderators.
				</Label>
			</div>

			{#if data.event.maxTeamMembers !== 0}
				<Label>
					Join a team! Get the code from your team leader!
				</Label>
				<div class="flex flex-row items-center gap-2">
					<SelectSimple options={teams} name="team" placeholder="Select Team" required />
					<Input type="text" name="code" placeholder="Team Code" required />
				</div>
			{/if}
			<div class="flex flex-col md:flex-row gap-2 justify-center">
				<Button class="flex-1" href="/event/{$page.params.event}" color="alternative">Go Back</Button>
				{#if data.event.maxTeamMembers !== 0}
					<Button class="flex-1" type="submit" disabled={joined}>Join Team</Button>
				{:else}
					<Button class="flex-1" type="submit" disabled={joined}>Join</Button>
				{/if}
			</div>

			

			{#if joined}
				<p class="text-green-700">You have successfully joined the event!</p>
			{/if}

			{#if form?.error}
				<h5 class="text-xl font-semibold text-red-700">
					<p>{form?.error}</p>
				</h5>
			{/if}
		</form>

		<form method="post" action="?/leave" class="my-8 mb-16 max-w-xl" use:enhance>
			<div class="flex flex-row gap-2 items-center justify-center">
				<p>Already joined?</p>
				<Button type="submit" variant="secondary">Leave Event</Button>
			</div>
			<p class="mt-2 text-center">
				Leaving the event will remove you from the leaderboard. Be sure you want to leave before doing so. There
				is no confirmation.
			</p>
		</form>
	{/if}
</main>
