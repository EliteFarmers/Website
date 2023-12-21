<script lang="ts">
	import Head from '$comp/head.svelte';
	import { ChannelType } from '$lib/utils';
	import { Accordion, AccordionItem, Button, Checkbox, Input, Label, Modal, Select } from 'flowbite-svelte';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	$: pings = data.pings ?? {};

	let clickOutsideModal = false;

	let sendUpdates = true;
	let tinyLbPing = false;

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

	$: console.log(data);
</script>

<Head title="Contest Pings" description="Manage upcoming Jacob Contest pings for your guild" />

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

	{#if !form?.success && form?.message}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.message}</p>
		</h5>
	{/if}

	<section class="flex flex-col gap-8 w-full justify-center items-center">
		<div
			class="flex flex-col justify-center justify-items-center gap-4 w-[90%] md:w-[70%] max-w-screen-lg bg-gray-100 dark:bg-zinc-800 rounded-md p-4"
		>
			<h2 class="text-3xl">Upcoming Contest Ping Settings</h2>

			<form method="post" action="?/disable" use:enhance>
				<Button type="submit" color="red" disabled={!pings.enabled}>
					Turn off Pings
				</Button>
			</form>
			
			<Checkbox name="enableUpdates" class="my-4" bind:checked={sendUpdates}>
				<span>Send update messages</span>
			</Checkbox>

			<Label class="space-y-2">
				<span>Channel to send pings in</span>
				<Select items={channels} value="" placeholder="Select a channel" name="channel" />
			</Label>

			<Label class="space-y-2">
				<span>Ping Role (for every upcoming contest message)</span>
				<Select items={roles} value="" placeholder="Select a role" name="pingrole" />
			</Label>

			<Label class="space-y-2">
				<span>Cactus Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Cactus" name="cactus" />
			</Label>
			<Label class="space-y-2">
				<span>Carrot Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Carrot" name="carrot" />
			</Label>
			<Label class="space-y-2">
				<span>Potato Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Potato" name="potato" />
			</Label>
			<Label class="space-y-2">
				<span>Wheat Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Wheat" name="wheat" />
			</Label>
			<Label class="space-y-2">
				<span>Melon Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Melon" name="melon" />
			</Label>
			<Label class="space-y-2">
				<span>Pumpkin Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Pumpkin" name="pumpkin" />
			</Label>
			<Label class="space-y-2">
				<span>Mushroom Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Mushroom" name="mushroom" />
			</Label>
			<Label class="space-y-2">
				<span>Cocoa Beans Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Cocoa Beans" name="cocoaBeans" />
			</Label>
			<Label class="space-y-2">
				<span>Sugar Cane Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Sugar Cane" name="sugarCane" />
			</Label>
			<Label class="space-y-2">
				<span>Nether Wart Ping Role</span>
				<Select items={roles} value="" placeholder="Select a role for Nether Wart" name="netherWart" />
			</Label>

			<Accordion flush={true} class="mx-4" multiple={true}>
				<AccordionItem>
					<div slot="header" class="text-black dark:text-white">
						<h4>Banned Participations</h4>
					</div>
				</AccordionItem>
			</Accordion>
		</div>
	</section>
</main>

<Modal title="Server Jacob Leaderboard Settings" bind:open={clickOutsideModal} autoclose={false}>
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
			<span>Leaderboard Name</span>
			<Input let:props name="title" placeholder="Title">
				<input {...props} type="text" maxlength="64" />
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
			<Checkbox name="tinyUpdatesPing" class="mb-4" bind:checked={tinyLbPing}>
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
			<Input let:props name="startDate">
				<input {...props} type="datetime-local" />
			</Input>
		</Label>
		<Label class="space-y-2 mb-4">
			<span>Allow scores until</span>
			<Input let:props name="endDate">
				<input {...props} type="datetime-local" />
			</Input>
		</Label>

		<Button formaction="?/create" type="submit">Edit/Create</Button>
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
			Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
		</p>
	</form>
</Modal>
