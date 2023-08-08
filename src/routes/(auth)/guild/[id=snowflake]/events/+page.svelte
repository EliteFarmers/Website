<script lang="ts">
	import { enhance } from '$app/forms';
	import { Accordion, AccordionItem, Button, Checkbox, Input, Label, Modal, Select } from 'flowbite-svelte';
	import type { PageData, ActionData } from './$types';
	import { ChannelType } from '$lib/utils';
	import Head from '$comp/head.svelte';

	export let data: PageData;
	export let form: ActionData;

	let clickOutsideModal = false;

	$: channels = (data.guildData?.channels ?? [])
		// Only allow text channels
		.filter((c) => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
		.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
		.map((c) => ({
			value: c.id ?? '',
			name: '#' + (c.name ?? ''),
		}))
		.filter((c) => c.value);

	$: roles = (data.guildData?.roles ?? [])
		.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))
		.map((r) => ({
			value: r.id ?? '',
			name: r.name ?? '',
		}))
		.filter((r) => r.value && r.name !== '@everyone');

	// Filter out events made more than a month ago
	$: recentEvents = data.createdEvents?.filter((e) => new Date(e.createdAt ?? 0).getTime() > Date.now() - 2592000000) ?? [];
</script>

<Head title="Events" description="Manage Events happening in your guild" />

<main class="flex flex-col items-center gap-4">
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

	<section class="flex flex-col gap-4">
		<p class="text-lg">
			You have {recentEvents.length} / {data.maxMonthlyEvents ?? 0} available Events created
		</p>
		{#if (recentEvents.length ?? 0) < (data.maxMonthlyEvents ?? 0)}
			<div class="flex w-full justify-center items-center">
				<Button on:click={() => (clickOutsideModal = true)}>Create New</Button>
			</div>
		{/if}
	</section>

	{#if form?.error}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.error}</p>
		</h5>
	{/if}

	<section class="flex flex-col gap-8 w-full justify-center items-center">
		<div
			class="flex flex-col justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg bg-gray-100 dark:bg-zinc-800 rounded-md"
		>
			<h2 class="text-3xl p-4">Manage Shared Settings</h2>
		</div>
	</section>

	<section class="flex flex-col gap-8 justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg mb-16">
		{#each data.events ?? [] as event (event.id)}
			<p>{event.name}</p>	
		<!-- <Jacobsettings {lb} {channels} {roles} /> -->
		{/each}
	</section>
</main>

<Modal title="Create New Event" bind:open={clickOutsideModal} autoclose={false}>
	<p>Events cannot be deleted after being created (right now), be sure you want to do this.</p>
	<form
		method="post"
		action="?/create"
		class="flex flex-col gap-2"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result) clickOutsideModal = false;
				update();
			};
		}}
	>
		<Label class="space-y-2">
			<span>Event Name</span>
			<Input let:props name="title" placeholder="Farming Weight Challenge">
				<input {...props} type="text" maxlength="64" />
			</Input>
		</Label>
		<Label class="space-y-2">
			<span>Event Description</span>
			<Input let:props name="description" placeholder="Farm as much as you can in 24 hours!">
				<textarea {...props} maxlength="1024" />
			</Input>
		</Label>
		<Label class="space-y-2">
			<span>Event Rules</span>
			<Input let:props name="rules" placeholder="No cheating.">
				<textarea {...props} maxlength="1024" />
			</Input>
		</Label>
		<Label class="space-y-2">
			<span>Event Prizes</span>
			<Input let:props name="prizes" placeholder="First Place: $20 in Gems!">
				<textarea {...props} maxlength="1024" />
			</Input>
		</Label>
		<Label class="space-y-2">
			<span>Role required to join event</span>
			<Select items={roles} value="" placeholder="Select a role" name="requiredRoleId" />
		</Label>
		<Label class="space-y-2">
			<span>Role blocked from joining</span>
			<Select items={roles} value="" placeholder="Select a role" name="blockedRoleId" />
		</Label>
		<Label class="space-y-2 mt-4">
			<span>Event Start Time</span>
			<Input let:props name="startDate">
				<input {...props} type="datetime-local" />
			</Input>
		</Label>
		<Label class="space-y-2 mb-4">
			<span>Event End Time</span>
			<Input let:props name="endDate">
				<input {...props} type="datetime-local" />
			</Input>
		</Label>

		<Button formaction="?/create" type="submit">Create</Button>
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
			Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
		</p>
	</form>
</Modal>
