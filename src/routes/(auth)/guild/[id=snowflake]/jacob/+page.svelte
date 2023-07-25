<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Checkbox, Input, Label, Modal, Select } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { ChannelType } from '$lib/utils';

	export let data: PageData;

	let clickOutsideModal = true;
	let sendUpdates = true;

	$: channels = (data.guildData?.channels ?? [])
		// Only allow text channels 
		.filter(c => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
		.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
		.map((c) => ({
			value: c.id ?? '',
			name: '#' + (c.name ?? '')
		})).filter(c => c.value);

	$: roles = (data.guildData?.roles ?? [])
		.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))
		.map((r) => ({
			value: r.id ?? '',
			name: r.name ?? ''
		})).filter(r => r.value && r.name !== '@everyone');
</script>

<main class="flex flex-col items-center">
	<div class="flex flex-row items-center gap-4">
		<img
			class="w-16 h-16"
			src="https://cdn.discordapp.com/icons/{data.guildId}/{data.guild?.icon}.webp"
			alt="Guild Icon"
		/>
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	<section class="flex flex-col gap-2">
		<p class="text-lg">
			You have {data.leaderboards?.length ?? 0} / {data.maxLeaderboards} available Jacob Leaderboards created
		</p>
		{#if (data.leaderboards?.length ?? 0) < (data.maxLeaderboards ?? 0)}
			<div class="flex w-full mb-16 justify-center items-center">
				<Button on:click={() => clickOutsideModal = true}>Create New</Button>
			</div>
		{/if}
	</section>

	{#each data.leaderboards ?? [] as lb (lb.id)}
		<section>
			<h3>
				{data.guild?.name} Jacob Leaderboard
			</h3>
		</section>
	{/each}
</main>

<Modal title="New Server Jacob Leaderboard" bind:open={clickOutsideModal} autoclose>
	<form method="post" action="?/create" class="flex flex-col gap-2" use:enhance>
		<Label class="space-y-2">
			<span>Leaderboard Name</span>
			<Input let:props name="title" placeholder="Title">
				<input {...props} type="text" maxlength="64">
			</Input>
		</Label>
		<Label class="space-y-2">
			<span>Channel to display leaderboard in</span>
			<Select items={channels} value="" placeholder="Select a channel" name="sendToChannelId" />
		</Label>
		<Checkbox name="enableUpdates" class="my-4" bind:checked={sendUpdates}>
			<span>Send update messages</span>
		</Checkbox>
		{#if sendUpdates}
			<Label class="space-y-2 -mt-4">
				<span>Role to mention when leaderboard updates</span>
				<Select items={roles} value="" placeholder="Select a role" name="mentionRoleId" />
			</Label>
			<Label class="space-y-2">
				<span>Channel to send leaderboard updates in</span>
				<Select items={channels} value="" placeholder="Select a channel" name="updatesChannelId" />
			</Label>
			<Checkbox name="tinyUpdatesPing" class="mb-4">
				<span>Ping for updates with tiny improvements</span>
			</Checkbox>
		{/if}
		<Label class="space-y-2">
			<span>Role required to submit scores</span>
			<Select items={roles} value="" placeholder="Select a role" name="requiredRoleId" />
		</Label>
		<Label class="space-y-2">
			<span>Role blacklisted from this leaderboard</span>
			<Select items={roles} value="" placeholder="Select a role" name="blockedRoleId" />
		</Label>

		<Label class="space-y-2 mt-4">
			<span>Allow scores only after</span>
			<Input let:props name="startDate" >
				<input {...props} type="datetime-local">
			</Input>
		</Label>
		<Label class="space-y-2 mb-4">
			<span>Allow scores until</span>
			<Input let:props name="endDate" >
				<input {...props} type="datetime-local">
			</Input>
		</Label>

		<Button type="submit">Create</Button>
	</form>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
	</p>
</Modal>
