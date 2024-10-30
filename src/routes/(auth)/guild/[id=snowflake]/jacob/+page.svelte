<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Checkbox } from '$ui/checkbox';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Accordion from '$ui/accordion';
	import * as Dialog from '$ui/dialog';
	import type { PageData, ActionData } from './$types';
	import { ChannelType } from '$lib/utils';
	import Jacobsettings from './jacobsettings.svelte';
	import { getReadableSkyblockDate } from '$lib/format';
	import Head from '$comp/head.svelte';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';

	export let data: PageData;
	export let form: ActionData;

	let clickOutsideModal = false;

	let sendUpdates = true;
	let tinyLbPing = false;

	$: channels = (data.guild?.channels ?? [])
		// Only allow text channels
		.filter((c) => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
		.map((c) => ({
			value: c.id ?? '',
			label: '#' + (c.name ?? ''),
		}))
		.filter((c) => c.value);

	$: roles = (data.guild?.roles ?? [])
		.map((r) => ({
			value: r.id ?? '',
			label: '@' + (r.name ?? ''),
		}))
		.filter((r) => r.value && r.label !== '@@everyone');

	$: excluded = (data.excludedParticipations ?? []).map((p) => {
		const [timestamp, crop, uuid] = p.split('-');
		return { timestamp, crop, uuid };
	});
</script>

<Head title="Jacob Leaderboards" description="Manage Jacob Leaderboards for your guild" />

<main class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<Guildicon guild={data.guild} size={16} />
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
			class="flex flex-col justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg bg-primary-foreground rounded-md"
		>
			<h2 class="text-3xl p-4">Manage Shared Settings</h2>
			<Accordion.Root class="mx-4" multiple={true}>
				<Accordion.Item value="banned">
					<Accordion.Trigger>
						<h4>Banned Participations</h4>
					</Accordion.Trigger>
					<Accordion.Content>
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
											<Button type="submit" size="sm" variant="destructive">
												<Trash2 size={16} />
											</Button>
										</form>
										<img
											class="w-8 h-8 pixelated"
											src="https://mc-heads.net/avatar/{p.uuid}/8"
											alt="User Avatar"
										/>
										<p>{p.crop}</p>
										<p>{getReadableSkyblockDate(p.timestamp)}</p>
										<Button size="sm" href="/contest/{p.timestamp}" color="alternative">View</Button
										>
									</div>
								{/each}
							</div>
						{:else}
							<p class="p-4">No participations are blocked from being on Jacob Leaderboards</p>
						{/if}
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="ranges">
					<Accordion.Trigger>
						<h4>Excluded Time Spans</h4>
					</Accordion.Trigger>
					<Accordion.Content>
						{#if (data.excludedTimespans ?? []).length > 0}
							<div class="flex flex-col gap-4">
								{#each data.excludedTimespans ?? [] as t (t)}
									<div class="flex flex-row items-center gap-4">
										<form method="post" action="?/unbantimespan" use:enhance>
											<input type="text" value={t.start} name="startTime" hidden />
											<input type="text" value={t.end} name="endTime" hidden />
											<Button type="submit" size="sm" variant="destructive">
												<Trash2 size={16} />
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
							<div class="flex flex-col md:flex-row gap-4 items-center mt-8">
								<div class="flex-1 flex flex-col items-start gap-1">
									<Label for="startDate">Start Time</Label>
									<Input name="startDate" type="datetime-local" />
								</div>
								<div class="flex-1 flex flex-col items-start gap-1">
									<Label for="endDate">End Time</Label>
									<Input name="endDate" type="datetime-local" />
								</div>
								<div class="flex-1 flex flex-col items-start gap-1">
									<Label for="reason">Reason</Label>
									<Input
										name="reason"
										placeholder="Enter reason for block"
										type="text"
										maxlength={64}
									/>
								</div>
								<Button type="submit" size="lg" class="md:mt-4">
									<Plus size={16} />
								</Button>
							</div>
						</form>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</section>

	<section class="flex flex-col gap-8 justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg mb-16">
		{#each data.leaderboards ?? [] as lb (lb.id)}
			<Jacobsettings {lb} {channels} {roles} />
		{/each}
	</section>
</main>

<Dialog.Root bind:open={clickOutsideModal}>
	<Dialog.Content class="max-h-[90%] overflow-y-scroll">
		<Dialog.Header>
			<h3 class="text-xl">Server Jacob Leaderboard Settings</h3>
		</Dialog.Header>
		<form
			method="post"
			action="?/create"
			class="flex flex-col gap-4"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) clickOutsideModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col items-start gap-1">
				<Label for="title">Leaderboard Name</Label>
				<Input name="title" placeholder="Title" maxlength={64} />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="sendToChannelId">Channel to display leaderboard in</Label>
				<Select.Simple options={channels} value="" placeholder="Select a channel" name="sendToChannelId" />
			</div>

			<div class="flex items-center gap-2">
				<Checkbox name="enableUpdates" bind:checked={sendUpdates} />
				<Label for="enableUpdates">Send update messages</Label>
			</div>

			{#if sendUpdates}
				<div class="flex flex-col items-start gap-1">
					<Label for="mentionRoleId">Role to mention when leaderboard updates</Label>
					<Select.Simple options={roles} value="" placeholder="Select a role" name="mentionRoleId" />
				</div>

				<div class="flex flex-col items-start gap-1">
					<Label for="updatesChannelId">Channel to send leaderboard updates in</Label>
					<Select.Simple options={channels} value="" placeholder="Select a channel" name="updatesChannelId" />
				</div>

				<div class="flex items-center gap-2">
					<Checkbox name="tinyUpdatesPing" bind:checked={tinyLbPing} />
					<Label for="tinyUpdatesPing">Ping for updates with tiny improvements</Label>
				</div>
			{/if}
			<div class="flex flex-col items-start gap-1">
				<Label for="requiredRoleId">Role required to submit scores</Label>
				<Select.Simple options={roles} value="" placeholder="Select a role" name="requiredRoleId" />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="blockedRoleId">Role blacklisted from this leaderboard</Label>
				<Select.Simple options={roles} value="" placeholder="Select a role" name="blockedRoleId" />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="startDate">Allow scores only after</Label>
				<Input name="startDate" type="datetime-local" />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="endDate">Allow scores until</Label>
				<Input name="endDate" type="datetime-local" />
			</div>

			<Button formaction="?/create" type="submit">Edit/Create</Button>
			<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.Content>
</Dialog.Root>
