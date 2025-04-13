<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import Mail from 'lucide-svelte/icons/mail';
	import RefreshCcw from 'lucide-svelte/icons/refresh-ccw';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import * as Accordion from '$ui/accordion';
	import * as Popover from '$ui/popover';
	import * as AlertDialog from '$ui/alert-dialog';
	import * as Tooltip from '$ui/tooltip';
	import { Button, buttonVariants } from '$ui/button';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	interface Props {
		lb: components['schemas']['GuildJacobLeaderboard'];
		channels: { value: string; label: string }[];
		roles: { value: string; label: string }[];
	}

	let { lb, channels, roles }: Props = $props();

	let crops = $derived(Object.entries(lb.crops ?? {}).filter(([, v]) => v.length > 0));

	let confirmModal = $state(false);
</script>

<div class="rounded-lgs flex w-full flex-col justify-between gap-4 rounded-md border-2 bg-card p-4">
	<div class="flex w-full flex-col justify-between gap-4 md:flex-row">
		<h3 class="text-2xl">{lb.title}</h3>
		<div class="flex flex-row gap-2">
			<!-- <Button class="edit" href="?/edit/{lb.id}" color="green">
						<GearSolid />
						<Popover triggeredBy=".edit" placement="left">
							<p>Edit Leaderboard</p>
						</Popover>
					</Button> -->
			<form method="post" action="{page.url.pathname}?/send" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<Popover.Mobile>
					{#snippet child({ props })}
						<div>
							<Button type="submit" color="green" {...props}>
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
							<Button type="submit" color="yellow" {...props}>
								<RefreshCcw />
							</Button>
						</div>
					{/snippet}
					<p>Clear all scores, but they can be submitted again</p>
				</Popover.Mobile>
			</form>
			<Popover.Mobile>
				{#snippet child({ props })}
					<Button onclick={() => (confirmModal = true)} variant="destructive" {...props}>
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
				<span class="rounded-md border bg-background p-1"
					>{channels.find((c) => c.value === lb.channelId)?.label ?? 'Not Set'}</span
				>
			</p>
			<p>
				<span class="font-semibold">Start:</span>
				<span class="rounded-md border bg-background p-1"
					>{lb.startCutoff === -1 ? 'Not Set' : getReadableSkyblockDate(lb.startCutoff ?? 0)}</span
				>
			</p>
			<p>
				<span class="font-semibold">End:</span>
				<span class="rounded-md border bg-background p-1"
					>{lb.endCutoff === -1 ? 'Not Set' : getReadableSkyblockDate(lb.endCutoff ?? 0)}</span
				>
			</p>
		</div>
		<div class="flex flex-col gap-3">
			<p>
				<span class="font-semibold">Updates:</span>
				<span class="rounded-md border bg-background p-1"
					>{channels.find((c) => c.value === lb.updateChannelId)?.label ?? 'Not Set'}</span
				>
			</p>
			<p>
				<span class="font-semibold">Update Role:</span>
				<span class="rounded-md border bg-background p-1"
					>{roles.find((c) => c.value === lb.updateRoleId)?.label ?? 'Not Set'}</span
				>
			</p>
		</div>
		<div class="flex flex-col gap-3">
			<p>
				<span class="font-semibold">Required Role:</span>
				<span class="rounded-md border bg-background p-1"
					>{roles.find((c) => c.value === lb.requiredRole)?.label ?? 'Not Set'}</span
				>
			</p>
			<p>
				<span class="font-semibold">Banned Role:</span>
				<span class="rounded-md border bg-background p-1"
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
											<Button type="submit" variant="destructive" size="icon" {...props}>
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
