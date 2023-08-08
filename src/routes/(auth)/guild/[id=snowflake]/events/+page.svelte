<script lang="ts">
	import { enhance } from '$app/forms';
	import { Accordion, AccordionItem, Button, Checkbox, Input, Label, Modal, Popover, Select } from 'flowbite-svelte';
	import type { PageData, ActionData } from './$types';
	import { ChannelType } from '$lib/utils';
	import Head from '$comp/head.svelte';
	import { ArrowUpRightFromSquareOutline, GearSolid, TrashBinSolid } from 'flowbite-svelte-icons';

	export let data: PageData;
	export let form: ActionData;

	let clickOutsideModal = false;

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

	<section class="flex flex-col gap-8 justify-center items-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg mb-16">
		{#each data.events ?? [] as { event, members, bans } (event.id)}
			<div
				class="flex p-4 flex-col justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg bg-gray-100 dark:bg-zinc-800 rounded-md"
			>
				<div class="flex flex-row justify-between">
					<div>
						<h2 class="text-3xl p-4">{event.name}</h2>

						<p class="text-lg p-4">{event.description}</p>
						<p class="text-lg p-4">{event.rules}</p>
						<p class="text-lg p-4">{event.prizeInfo}</p>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<form method="post" action="?/edit" use:enhance>
							<input type="hidden" name="id" value={event.id} />
							<Button class="send" type="submit" color="green">
								<GearSolid />
								<Popover triggeredBy=".send" placement="left">
									<p>Edit Event</p>
								</Popover>
							</Button>
						</form>
						<Button class="send" href="/event/{event.id}" color="blue">
							<ArrowUpRightFromSquareOutline />
							<Popover triggeredBy=".send" placement="left">
								<p>View Event Page</p>
							</Popover>
						</Button>
					</div>
				</div>
				<Accordion flush={true}>
					<AccordionItem paddingFlush="p-2">
						<span slot="header" class="text-lg first-letter:capitalize">Event Members</span>
						{#each members as member (member.playerUuid)}
							<div class="flex items-center flex-row gap-8 space-y-2 text-black dark:text-white">
								<form method="POST" action="?/banmember" use:enhance>
									<input type="hidden" name="id" value={event.id} />
									<input type="hidden" name="uuid" value={member.playerUuid} />
									<Button type="submit" color="red" class="ban" size="sm">
										<TrashBinSolid size="sm" />
										<Popover triggeredBy=".ban" placement="left">
											<p>Ban this user from the event</p>
										</Popover>
									</Button>
								</form>
								<p class="text-lg">{member.playerName}</p>
								<p>{member.amountGained}</p>
							</div>
						{/each}
					</AccordionItem>
					<AccordionItem paddingFlush="p-2">
						<span slot="header" class="text-lg first-letter:capitalize">Banned Event Members</span>
						{#each bans as member (member.playerUuid)}
							<div class="flex items-center flex-row gap-8 space-y-2 text-black dark:text-white">
								<form method="POST" action="?/banmember" use:enhance>
									<input type="hidden" name="id" value={event.id} />
									<input type="hidden" name="uuid" value={member.playerUuid} />
									<Button type="submit" color="red" class="ban" size="sm">
										<TrashBinSolid size="sm" />
										<Popover triggeredBy=".ban" placement="left">
											<p>Ban this user from the event</p>
										</Popover>
									</Button>
								</form>
								<p class="text-lg">{member.playerName}</p>
								<p>{member.amountGained}</p>
								<p>{member.notes}</p>
							</div>
						{/each}
					</AccordionItem>
				</Accordion>
			</div>
		{/each}
	</section>
</main>

<Modal title="Create New Event" bind:open={clickOutsideModal} autoclose={false}>
	<p>Events cannot be deleted after being created (right now), be sure that you want to do this.</p>
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
		<!-- <Label class="space-y-2">
			<span>Role required to join event</span>
			<Select items={roles} value="" placeholder="Select a role" name="requiredRoleId" />
		</Label>
		<Label class="space-y-2">
			<span>Role blocked from joining</span>
			<Select items={roles} value="" placeholder="Select a role" name="blockedRoleId" />
		</Label> -->
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
