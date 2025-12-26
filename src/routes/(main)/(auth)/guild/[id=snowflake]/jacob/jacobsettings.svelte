<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { GuildJacobLeaderboard } from '$lib/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import * as Accordion from '$ui/accordion';
	import * as AlertDialog from '$ui/alert-dialog';
	import { Button, buttonVariants } from '$ui/button';
	import { Checkbox } from '$ui/checkbox';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Popover from '$ui/popover';
	import * as Select from '$ui/select';
	import * as Tooltip from '$ui/tooltip';
	import Copy from '@lucide/svelte/icons/copy';
	import Mail from '@lucide/svelte/icons/mail';
	import Pencil from '@lucide/svelte/icons/pencil';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	interface Props {
		lb: GuildJacobLeaderboard;
		channels: { value: string; label: string }[];
		roles: { value: string; label: string }[];
	}

	let { lb, channels, roles }: Props = $props();

	let crops = $derived(Object.entries(lb.crops ?? {}).filter(([, v]) => v.length > 0));

	let confirmModal = $state(false);
	let editModal = $state(false);

	let editSendUpdates = $state(!!(lb.updateChannelId || lb.updateRoleId));
	let editTinyUpdatesPing = $state(!!lb.pingForSmallImprovements);

	function toDatetimeLocal(seconds?: bigint | number | null): string {
		if (seconds === null || seconds === undefined) return '';
		if (typeof seconds === 'bigint') {
			if (seconds === -1n) return '';
			seconds = Number(seconds);
		}
		if (!seconds || seconds <= 0) return '';
		const date = new Date(seconds * 1000);
		const tzOffsetMs = date.getTimezoneOffset() * 60_000;
		return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
	}

	function openEdit() {
		editSendUpdates = !!(lb.updateChannelId || lb.updateRoleId);
		editTinyUpdatesPing = !!lb.pingForSmallImprovements;
		editModal = true;
	}
</script>

<div class="rounded-lgs bg-card flex w-full flex-col justify-between gap-4 rounded-md border-2 p-4">
	<div class="flex w-full flex-col justify-between gap-4 md:flex-row">
		<h3 class="text-2xl">{lb.title}</h3>
		<div class="flex flex-row gap-2">
			<Popover.Mobile>
				{#snippet child({ props })}
					<Button {...props} onclick={openEdit} color="alternative">
						<Pencil />
					</Button>
				{/snippet}
				<div>
					<p>Edit Leaderboard</p>
				</div>
			</Popover.Mobile>
			<form method="post" action="{page.url.pathname}?/duplicate" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button {...props} type="submit" color="alternative">
								<Copy />
							</Button>
						</div>
					{/snippet}
					<div>
						<p>Duplicate Leaderboard</p>
					</div>
				</Popover.Mobile>
			</form>
			<form method="post" action="{page.url.pathname}?/send" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button {...props} type="submit" color="green">
								<Mail />
							</Button>
						</div>
					{/snippet}
					<div>
						<p>Send Leaderboard in Discord</p>
					</div>
				</Popover.Mobile>
			</form>
			<form method="post" action="{page.url.pathname}?/clear" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button {...props} type="submit" color="yellow">
								<RefreshCcw />
							</Button>
						</div>
					{/snippet}
					<p>Clear all scores, but they can be submitted again</p>
				</Popover.Mobile>
			</form>
			<Popover.Mobile>
				{#snippet child({ props })}
					<Button {...props} onclick={() => (confirmModal = true)} variant="destructive">
						<Trash2 />
					</Button>
				{/snippet}
				<div>
					<p>Delete Leaderboard</p>
				</div>
			</Popover.Mobile>
		</div>
	</div>
	<div class="flex w-full flex-col justify-between gap-3 md:flex-row">
		<div class="flex flex-col gap-3">
			<p>
				<span class="font-semibold">Channel:</span>
				<span class="bg-background rounded-md border p-1"
					>{channels.find((c) => c.value === lb.channelId)?.label ?? 'Not Set'}</span
				>
			</p>
			<p>
				<span class="font-semibold">Start:</span>
				<span class="bg-background rounded-md border p-1"
					>{lb.startCutoff == -1n ? 'Not Set' : getReadableSkyblockDate(lb.startCutoff ?? 0)}</span
				>
			</p>
			<p>
				<span class="font-semibold">End:</span>
				<span class="bg-background rounded-md border p-1"
					>{lb.endCutoff == -1n ? 'Not Set' : getReadableSkyblockDate(lb.endCutoff ?? 0)}</span
				>
			</p>
		</div>
		<div class="flex flex-col gap-3">
			<p>
				<span class="font-semibold">Updates:</span>
				<span class="bg-background rounded-md border p-1"
					>{channels.find((c) => c.value === lb.updateChannelId)?.label ?? 'Not Set'}</span
				>
			</p>
			<p>
				<span class="font-semibold">Update Role:</span>
				<span class="bg-background rounded-md border p-1"
					>{roles.find((c) => c.value === lb.updateRoleId)?.label ?? 'Not Set'}</span
				>
			</p>
		</div>
		<div class="flex flex-col gap-3">
			<p>
				<span class="font-semibold">Required Role:</span>
				<span class="bg-background rounded-md border p-1"
					>{roles.find((c) => c.value === lb.requiredRole)?.label ?? 'Not Set'}</span
				>
			</p>
			<p>
				<span class="font-semibold">Banned Role:</span>
				<span class="bg-background rounded-md border p-1"
					>{roles.find((c) => c.value === lb.blockedRole)?.label ?? 'Not Set'}</span
				>
			</p>
		</div>
	</div>

	{#if crops.length > 0}
		<Accordion.Root type="single">
			{#each crops as [crop, entries] (crop)}
				<Accordion.Item value={crop}>
					<Accordion.Trigger class="py-2">
						<p class="text-lg first-letter:capitalize">
							{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)}
						</p>
					</Accordion.Trigger>
					<Accordion.Content>
						{#each entries as entry (entry)}
							<div class="my-2 flex flex-row items-center gap-8">
								<form method="POST" action="{page.url.pathname}?/banparticipation" use:enhance>
									<input type="hidden" name="id" value={lb.id} />
									<input type="hidden" name="uuid" value={entry.uuid} />
									<input type="hidden" name="crop" value={entry.record?.crop} />
									<input type="hidden" name="time" value={entry.record?.timestamp} />
									<Tooltip.Simple>
										{#snippet child({ props })}
											<Button {...props} type="submit" variant="destructive" size="icon">
												<Trash2 size={20} />
											</Button>
										{/snippet}
										<p>Remove and block this Participation</p>
									</Tooltip.Simple>
								</form>
								<p class="text-lg">{entry.ign}</p>
								<p class="font-mono text-lg">{entry.record?.collected?.toLocaleString()}</p>
							</div>
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	{:else}
		<p class="text-center">No scores submitted yet</p>
	{/if}
</div>

<Dialog.Root bind:open={editModal}>
	<Dialog.ScrollContent>
		<Dialog.Header>
			<h3 class="text-xl">Edit Jacob Leaderboard</h3>
		</Dialog.Header>
		<form
			method="post"
			action="{page.url.pathname}?/edit"
			class="mx-1 mt-4 flex flex-col gap-4"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result?.type === 'success') editModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="id" value={lb.id} />

			<div class="flex flex-col items-start gap-1">
				<Label for="title">Leaderboard Name</Label>
				<Input name="title" placeholder="Title" maxlength={64} value={lb.title ?? ''} />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="sendToChannelId">Channel to display leaderboard in</Label>
				<Select.Simple
					options={channels}
					value={lb.channelId ?? ''}
					placeholder="Select a channel"
					name="sendToChannelId"
				/>
			</div>

			<div class="flex items-center gap-2">
				<Checkbox name="enableUpdates" bind:checked={editSendUpdates} />
				<Label for="enableUpdates">Send update messages</Label>
			</div>

			{#if editSendUpdates}
				<div class="flex flex-col items-start gap-1">
					<Label for="mentionRoleId">Role to mention when leaderboard updates</Label>
					<Select.Simple
						options={roles}
						value={lb.updateRoleId ?? ''}
						placeholder="Select a role"
						name="mentionRoleId"
					/>
				</div>

				<div class="flex flex-col items-start gap-1">
					<Label for="updatesChannelId">Channel to send leaderboard updates in</Label>
					<Select.Simple
						options={channels}
						value={lb.updateChannelId ?? ''}
						placeholder="Select a channel"
						name="updatesChannelId"
					/>
				</div>

				<div class="flex items-center gap-2">
					<Checkbox name="tinyUpdatesPing" bind:checked={editTinyUpdatesPing} />
					<Label for="tinyUpdatesPing">Ping for updates with tiny improvements</Label>
				</div>
			{/if}

			<div class="flex flex-col items-start gap-1">
				<Label for="requiredRoleId">Role required to submit scores</Label>
				<Select.Simple
					options={roles}
					value={lb.requiredRole ?? ''}
					placeholder="Select a role"
					name="requiredRoleId"
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="blockedRoleId">Role blacklisted from this leaderboard</Label>
				<Select.Simple
					options={roles}
					value={lb.blockedRole ?? ''}
					placeholder="Select a role"
					name="blockedRoleId"
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="startDate">Allow scores only after</Label>
				<Input name="startDate" type="datetime-local" value={toDatetimeLocal(lb.startCutoff)} />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="endDate">Allow scores until</Label>
				<Input name="endDate" type="datetime-local" value={toDatetimeLocal(lb.endCutoff)} />
			</div>

			<Button type="submit">Save</Button>
		</form>
	</Dialog.ScrollContent>
</Dialog.Root>

<AlertDialog.Root bind:open={confirmModal}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure you want to delete this leaderboard?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete the leaderboard and all scores associated
				with it.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="{page.url.pathname}?/delete" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<AlertDialog.Action type="submit" class={buttonVariants({ variant: 'destructive' })}
					>Delete</AlertDialog.Action
				>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
