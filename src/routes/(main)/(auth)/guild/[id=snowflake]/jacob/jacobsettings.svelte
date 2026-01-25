<script lang="ts">
	import type { GuildJacobLeaderboard } from '$lib/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import {
		banJacobParticipationForm as banParticipationForm,
		banJacobLeaderboardPlayer as banPlayerForm,
		clearJacobLeaderboardForm as clearForm,
		removeJacobLeaderboardForm as deleteForm,
		duplicateJacobLeaderboardForm as duplicateForm,
		editJacobLeaderboardForm as editForm,
		sendJacobLeaderboardForm as sendForm,
	} from '$lib/remote/jacob.remote';
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
	import UserX from '@lucide/svelte/icons/user-x';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	interface Props {
		lb: GuildJacobLeaderboard;
		channels: { value: string; label: string }[];
		roles: { value: string; label: string }[];
	}

	let { lb, channels, roles }: Props = $props();

	let crops = $derived(Object.entries(lb.crops ?? {}).filter(([, v]) => v.length > 0));
	const duplicate = $derived.by(() => duplicateForm.for(lb.id));
	const send = $derived.by(() => sendForm.for(lb.id));
	const clear = $derived.by(() => clearForm.for(lb.id));
	const edit = $derived.by(() => editForm.for(lb.id));
	const remove = $derived.by(() => deleteForm.for(lb.id));

	let confirmModal = $state(false);
	let editModal = $state(false);

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
		edit.fields.set({
			id: lb.id,
			title: lb.title ?? '',
			sendToChannelId: lb.channelId ?? '',
			enableUpdates: !!(lb.updateChannelId || lb.updateRoleId),
			mentionRoleId: lb.updateRoleId ?? '',
			updatesChannelId: lb.updateChannelId ?? '',
			tinyUpdatesPing: !!lb.pingForSmallImprovements,
			requiredRoleId: lb.requiredRole ?? '',
			blockedRoleId: lb.blockedRole ?? '',
			startDate: toDatetimeLocal(lb.startCutoff),
			endDate: toDatetimeLocal(lb.endCutoff),
		});
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
			<form {...duplicate}>
				<input type="hidden" {...duplicate.fields.id.as('text')} value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button {...props} type="submit" color="alternative" disabled={!!duplicate.pending}>
								<Copy />
							</Button>
						</div>
					{/snippet}
					<div>
						<p>Duplicate Leaderboard</p>
					</div>
				</Popover.Mobile>
			</form>
			<form {...send}>
				<input type="hidden" {...send.fields.id.as('text')} value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button {...props} type="submit" color="green" disabled={!!send.pending}>
								<Mail />
							</Button>
						</div>
					{/snippet}
					<div>
						<p>Send Leaderboard in Discord</p>
					</div>
				</Popover.Mobile>
			</form>
			<form {...clear}>
				<input type="hidden" {...clear.fields.id.as('text')} value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button {...props} type="submit" color="yellow" disabled={!!clear.pending}>
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
							{@const ban = banParticipationForm.for(
								`${lb.id}-${entry.uuid}-${entry.record?.timestamp}-${entry.record?.crop}`
							)}
							{@const banPlayer = banPlayerForm.for(
								`${lb.id}-${entry.uuid}-player-${entry.record?.crop}`
							)}
							<div class="my-2 flex flex-row items-center gap-8">
								<form {...ban}>
									<input type="hidden" {...ban.fields.uuid.as('text')} value={entry.uuid} />
									<input type="hidden" {...ban.fields.crop.as('text')} value={entry.record?.crop} />
									<input
										type="hidden"
										{...ban.fields.time.as('text')}
										value={entry.record?.timestamp}
									/>
									<Tooltip.Simple>
										{#snippet child({ props })}
											<Button
												{...props}
												type="submit"
												variant="destructive"
												size="icon"
												disabled={!!ban.pending}
											>
												<Trash2 size={20} />
											</Button>
										{/snippet}
										<p>Remove and block this Participation</p>
									</Tooltip.Simple>
								</form>
								<form {...banPlayer}>
									<input type="hidden" {...banPlayer.fields.uuid.as('text')} value={entry.uuid} />
									<Tooltip.Simple>
										{#snippet child({ props })}
											<Button
												{...props}
												type="submit"
												variant="destructive"
												size="icon"
												disabled={!!banPlayer.pending}
											>
												<UserX size={20} />
											</Button>
										{/snippet}
										<p>Ban this player from all Jacob leaderboards</p>
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
			{...edit.enhance(async ({ submit }) => {
				await submit();
				if (edit.result?.success) editModal = false;
			})}
			class="mx-1 mt-4 flex flex-col gap-4"
		>
			<input type="hidden" {...edit.fields.id.as('text')} value={lb.id} />

			<div class="flex flex-col items-start gap-1">
				<Label for="title">Leaderboard Name</Label>
				<Input {...edit.fields.title.as('text')} placeholder="Title" maxlength={64} />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="sendToChannelId">Channel to display leaderboard in</Label>
				<input
					type="hidden"
					{...edit.fields.sendToChannelId.as('text')}
					value={edit.fields.sendToChannelId.value() ?? ''}
				/>
				<Select.Simple
					options={channels}
					placeholder="Select a channel"
					bind:value={
						() => edit.fields.sendToChannelId.value() ?? '', (val) => edit.fields.sendToChannelId.set(val)
					}
				/>
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					class="hidden"
					name={edit.fields.enableUpdates.as('checkbox').name}
					value="true"
					aria-invalid={edit.fields.enableUpdates.as('checkbox')['aria-invalid']}
					bind:checked={
						() => edit.fields.enableUpdates.value() ?? false, (val) => edit.fields.enableUpdates.set(val)
					}
				/>
				<Checkbox
					id="enableUpdates"
					bind:checked={
						() => edit.fields.enableUpdates.value() ?? false, (val) => edit.fields.enableUpdates.set(val)
					}
				/>
				<Label for="enableUpdates">Send update messages</Label>
			</div>

			{#if edit.fields.enableUpdates.value() ?? false}
				<div class="flex flex-col items-start gap-1">
					<Label for="mentionRoleId">Role to mention when leaderboard updates</Label>
					<input
						type="hidden"
						{...edit.fields.mentionRoleId.as('text')}
						value={edit.fields.mentionRoleId.value() ?? ''}
					/>
					<Select.Simple
						options={roles}
						placeholder="Select a role"
						bind:value={
							() => edit.fields.mentionRoleId.value() ?? '', (val) => edit.fields.mentionRoleId.set(val)
						}
					/>
				</div>

				<div class="flex flex-col items-start gap-1">
					<Label for="updatesChannelId">Channel to send leaderboard updates in</Label>
					<input
						type="hidden"
						{...edit.fields.updatesChannelId.as('text')}
						value={edit.fields.updatesChannelId.value() ?? ''}
					/>
					<Select.Simple
						options={channels}
						placeholder="Select a channel"
						bind:value={
							() => edit.fields.updatesChannelId.value() ?? '',
							(val) => edit.fields.updatesChannelId.set(val)
						}
					/>
				</div>

				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						class="hidden"
						name={edit.fields.tinyUpdatesPing.as('checkbox').name}
						value="true"
						aria-invalid={edit.fields.tinyUpdatesPing.as('checkbox')['aria-invalid']}
						bind:checked={
							() => edit.fields.tinyUpdatesPing.value() ?? false,
							(val) => edit.fields.tinyUpdatesPing.set(val)
						}
					/>
					<Checkbox
						id="tinyUpdatesPing"
						bind:checked={
							() => edit.fields.tinyUpdatesPing.value() ?? false,
							(val) => edit.fields.tinyUpdatesPing.set(val)
						}
					/>
					<Label for="tinyUpdatesPing">Ping for updates with tiny improvements</Label>
				</div>
			{/if}

			<div class="flex flex-col items-start gap-1">
				<Label for="requiredRoleId">Role required to submit scores</Label>
				<input
					type="hidden"
					{...edit.fields.requiredRoleId.as('text')}
					value={edit.fields.requiredRoleId.value() ?? ''}
				/>
				<Select.Simple
					options={roles}
					placeholder="Select a role"
					bind:value={
						() => edit.fields.requiredRoleId.value() ?? '', (val) => edit.fields.requiredRoleId.set(val)
					}
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="blockedRoleId">Role blacklisted from this leaderboard</Label>
				<input
					type="hidden"
					{...edit.fields.blockedRoleId.as('text')}
					value={edit.fields.blockedRoleId.value() ?? ''}
				/>
				<Select.Simple
					options={roles}
					placeholder="Select a role"
					bind:value={
						() => edit.fields.blockedRoleId.value() ?? '', (val) => edit.fields.blockedRoleId.set(val)
					}
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="startDate">Allow scores only after</Label>
				<Input {...edit.fields.startDate.as('text')} type="datetime-local" />
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="endDate">Allow scores until</Label>
				<Input {...edit.fields.endDate.as('text')} type="datetime-local" />
			</div>

			<Button type="submit" disabled={!!edit.pending}>Save</Button>
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
			<form {...remove}>
				<input type="hidden" {...remove.fields.id.as('text')} value={lb.id} />
				<AlertDialog.Action
					type="submit"
					class={buttonVariants({ variant: 'destructive' })}
					disabled={!!remove.pending}>Delete</AlertDialog.Action
				>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
