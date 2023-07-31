<script lang="ts">
	import { enhance } from '$app/forms';
	import { Accordion, AccordionItem, Button, Checkbox, Input, Label, Modal, Select } from 'flowbite-svelte';
	import type { PageData, ActionData } from './$types';
	import { ChannelType } from '$lib/utils';
	import Jacobsettings from './jacobsettings.svelte';
	import { getReadableSkyblockDate } from '$lib/format';
	import { PlusOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import Head from '$comp/head.svelte';

	export let data: PageData;
	export let form: ActionData;

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

	$: excluded = (data.excludedParticipations ?? []).map((p) => {
		const [timestamp, crop, uuid] = p.split('-');
		return { timestamp, crop, uuid };
	});
</script>

<Head title="Jacob Leaderboards" description="Manage Jacob Leaderboards for your guild" />

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
			You have {data.leaderboards?.length ?? 0} / {data.maxLeaderboards} available Jacob Leaderboards created
		</p>
		{#if (data.leaderboards?.length ?? 0) < (data.maxLeaderboards ?? 0)}
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
			<Accordion flush={true} class="mx-4" multiple={true}>
				<AccordionItem>
					<div slot="header" class="text-black dark:text-white">
						<h4>Banned Participations</h4>
					</div>
					{#if (data.excludedParticipations ?? []).length > 0}
						<div class="flex flex-col gap-4">
							{#each excluded as p (p)}
								<div class="flex flex-row items-center gap-4">
									<form method="post" action="?/unbanparticipation" use:enhance>
										<input
											type="text"
											value="{p.timestamp}-{p.crop}-{p.uuid}"
											name="participationId"
											hidden
										/>
										<Button type="submit" size="sm">
											<TrashBinOutline size="sm" />
										</Button>
									</form>
									<img
										class="w-8 h-8 pixelated"
										src="https://mc-heads.net/avatar/{p.uuid}/8"
										alt="User Avatar"
									/>
									<p>{p.crop}</p>
									<p>{getReadableSkyblockDate(p.timestamp)}</p>
									<Button size="sm" href="/contest/{p.timestamp}" color="alternative">View</Button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="p-4">No participations are blocked from being on Jacob Leaderboards</p>
					{/if}
				</AccordionItem>
				<AccordionItem>
					<div slot="header" class="text-black dark:text-white">
						<h4>Excluded Time Spans</h4>
					</div>
					{#if (data.excludedTimespans ?? []).length > 0}
						<div class="flex flex-col gap-4">
							{#each data.excludedTimespans ?? [] as t (t)}
								<div class="flex flex-row items-center gap-4">
									<form method="post" action="?/unbantimespan" use:enhance>
										<input type="text" value={t.start} name="startTime" hidden />
										<input type="text" value={t.end} name="endTime" hidden />
										<Button type="submit" size="sm">
											<TrashBinOutline size="sm" />
										</Button>
									</form>
									<div class="flex flex-col md:flex-row gap-8">
										<div class="flex flex-col gap-2">
											<p>{new Date((t.start ?? 0) * 1000).toLocaleDateString()}</p>
											<p>{getReadableSkyblockDate(t.start ?? 0)}</p>
										</div>
										<div class="flex flex-col gap-2">
											<p>{new Date((t.end ?? 0) * 1000).toLocaleDateString()}</p>
											<p>{getReadableSkyblockDate(t.end ?? 0)}</p>
										</div>
									</div>
									<p>{t.reason ?? 'No reason provided'}</p>
								</div>
							{/each}
						</div>
					{:else}
						<p class="p-4">No time spans are excluded from being on Jacob Leaderboards</p>
					{/if}

					<form method="post" action="?/bantimespan" use:enhance>
						<div class="flex flex-col md:flex-row gap-4 items-center mt-4">
							<Label class="">
								<span>Start Time</span>
								<Input let:props name="startDate">
									<input {...props} type="datetime-local" />
								</Input>
							</Label>
							<Label class="">
								<span>End Time</span>
								<Input let:props name="endDate">
									<input {...props} type="datetime-local" />
								</Input>
							</Label>
							<Label class="w-full">
								<span>Reason</span>
								<Input let:props name="reason" placeholder="Enter reason for block">
									<input {...props} type="text" maxlength="64" />
								</Input>
							</Label>
							<Button type="submit" color="red" size="lg" class="md:mt-4">
								<PlusOutline size="sm" />
							</Button>
						</div>
					</form>
				</AccordionItem>
			</Accordion>
		</div>
	</section>

	<section class="flex flex-col gap-8 justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg mb-16">
		{#each data.leaderboards ?? [] as lb (lb.id)}
			<Jacobsettings {lb} {channels} {roles} />
		{/each}
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
