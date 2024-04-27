<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { Input } from '$ui/input';
	import { Textarea } from '$ui/textarea';
	import * as Accordion from '$ui/accordion';
	import * as Popover from '$ui/popover';
	import * as Dialog from '$ui/dialog';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import Settings from 'lucide-svelte/icons/settings';
	import type { PageData, ActionData } from './$types';
	import Head from '$comp/head.svelte';
	import Member from './member.svelte';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';
	import CreateEvent from './create-event.svelte';

	export let data: PageData;
	export let form: ActionData;

	let clickOutsideModal = false;
	let clickOutsideModalEdit = false;
	let banMemberModal = false;

	let banMemberName = '';
	let banMemberUuid = '';

	let selectedEventId = '';

	// Filter out events made more than a month ago
	$: recentEvents =
		data.createdEvents?.filter((e) => new Date(e.createdAt ?? 0).getTime() > Date.now() - 2592000000) ?? [];
</script>

<Head title="Events" description="Manage Events happening in your guild" />

<main class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<Guildicon guild={data.guild} size={16} />
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

	<section
		class="flex flex-col gap-8 justify-center items-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg mb-16"
	>
		{#each data.events?.sort((a, b) => b?.event?.endTime?.localeCompare(a?.event?.endTime ?? '') ?? 0) ?? [] as { event, members, bans } (event.id)}
			<div
				class="flex p-4 flex-col justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg bg-primary-foreground rounded-md"
			>
				<div class="flex flex-row justify-between p-4 gap-2">
					<div class="flex flex-col gap-2">
						<h2 class="text-3xl">{event.name}</h2>

						<p class="text-lg">{event.description}</p>
						<p class="text-lg">{event.rules}</p>
						<p class="text-lg">{event.prizeInfo}</p>
						<div class="flex flex-row gap-2 font-semibold items-center text-lg">
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleTimeString()}</span>
							<span> - </span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleTimeString()}</span>
						</div>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<Popover.Mobile>
							<div slot="trigger">
								<Button
									on:click={() => {
										clickOutsideModalEdit = true;
										selectedEventId = event.id ?? '';
									}}
								>
									<Settings />
								</Button>
							</div>
							<div>
								<p>Edit Event</p>
							</div>
						</Popover.Mobile>

						<Popover.Mobile>
							<div slot="trigger">
								<Button href="/event/{event.id}">
									<ExternalLink />
								</Button>
							</div>
							<div>
								<p>View Event Page</p>
							</div>
						</Popover.Mobile>
					</div>
				</div>
				<Accordion.Root>
					<Accordion.Item value="members">
						<Accordion.Trigger>
							<p class="text-lg">Event Members</p>
						</Accordion.Trigger>
						<Accordion.Content>
							<div class="flex flex-col w-full justify-center items-center gap-2 justify-items-center">
								{#each members as member (member.playerUuid)}
									<Member {member}>
										<Popover.Mobile>
											<div slot="trigger">
												<Button
													size="sm"
													on:click={() => {
														banMemberName = member.playerName ?? '';
														banMemberUuid = member.playerUuid ?? '';
														selectedEventId = event.id ?? '';
														banMemberModal = true;
													}}
												>
													<Trash2 size={16} class="text-destructive" />
												</Button>
											</div>
											<div>
												<p>Ban this user from the event</p>
											</div>
										</Popover.Mobile>
									</Member>
								{/each}
							</div>
						</Accordion.Content>
					</Accordion.Item>
					<Accordion.Item value="bans">
						<Accordion.Trigger>
							<p class="text-lg">Removed Event Members</p>
						</Accordion.Trigger>
						<Accordion.Content>
							<div class="flex flex-col w-full justify-center items-center gap-2 justify-items-center">
								{#each bans as member (member.playerUuid)}
									<Member {member}>
										<form method="POST" action="?/unbanmember" use:enhance>
											<input type="hidden" name="id" value={event.id} />
											<input type="hidden" name="uuid" value={member.playerUuid} />
											<Popover.Mobile>
												<div slot="trigger">
													<Button type="submit" color="green" class="unban" size="sm">
														<ArrowUp size={16} />
													</Button>
												</div>
												<div>
													<p>Unban this user from the event</p>
												</div>
											</Popover.Mobile>
										</form>
									</Member>
								{/each}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</div>
		{/each}
	</section>
</main>

<Dialog.Root bind:open={banMemberModal}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>{banMemberName} - {banMemberUuid}</Dialog.Title>
		<form
			method="post"
			action="?/banmember"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) banMemberModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="id" bind:value={selectedEventId} />
			<input type="hidden" name="uuid" bind:value={banMemberUuid} />
			<div class="space-y-2">
				<Label>Ban Reason</Label>
				<Input name="reason" placeholder="Cheating - Macro" maxlength={64} required />
			</div>

			<Button type="submit">Ban</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<CreateEvent bind:open={clickOutsideModal} />

<Dialog.Root bind:open={clickOutsideModalEdit}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>Edit Event</Dialog.Title>
		<p>Only fill in fields that you want to be changed.</p>
		<form
			method="post"
			action="?/edit"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) clickOutsideModalEdit = false;
					update();
				};
			}}
		>
			<input type="text" name="id" bind:value={selectedEventId} hidden />
			<div class="space-y-2">
				<Label>Event Name</Label>
				<Input name="title" placeholder="Farming Weight Challenge" maxlength={64} />
			</div>
			<div class="space-y-2">
				<Label>Event Description</Label>
				<Textarea name="description" placeholder="Farm as much as you can in 24 hours!" maxlength={1024} />
			</div>
			<div class="space-y-2">
				<Label>Event Rules</Label>
				<Textarea name="rules" placeholder="No cheating." maxlength={1024} />
			</div>
			<div class="space-y-2">
				<Label>Event Prizes</Label>
				<Textarea name="prizes" placeholder="First Place: $20 in Gems!" maxlength={1024} />
			</div>
			<div class="space-y-2 mt-4">
				<Label>Event Start Time</Label>
				<Input name="startDate" type="datetime-local" />
			</div>
			<div class="space-y-2 mb-4">
				<Label>Event End Time</Label>
				<Input name="endDate" type="datetime-local" />
			</div>

			<Button type="submit">Edit Event</Button>
			<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.Content>
</Dialog.Root>
