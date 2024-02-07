<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import Mail from 'lucide-svelte/icons/mail';
	import RefreshCcw from 'lucide-svelte/icons/refresh-ccw';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import * as Accordion from '$ui/accordion';
	import * as Tooltip from '$ui/tooltip';
	import * as AlertDialog from '$ui/alert-dialog';
	import { Button } from '$ui/button';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	export let lb: components['schemas']['GuildJacobLeaderboard'];
	export let channels: { value: string; label: string }[];
	export let roles: { value: string; label: string }[];

	$: crops = Object.entries(lb.crops ?? {}).filter(([, v]) => v.length > 0);

	let confirmModal = false;
</script>

<div class="flex flex-col justify-between gap-4 p-4 rounded-md bg-primary-foreground w-full rounded-lgs">
	<div class="flex flex-row justify-between gap-4 w-full">
		<div class="flex flex-col gap-2">
			<h3 class="text-2xl">{lb.title}</h3>
			<p>
				<span class="font-semibold">Start:</span>
				{lb.startCutoff === -1 ? 'Not Set' : getReadableSkyblockDate(lb.startCutoff ?? 0)}
			</p>
			<p>
				<span class="font-semibold">End:</span>
				{lb.endCutoff === -1 ? 'Not Set' : getReadableSkyblockDate(lb.endCutoff ?? 0)}
			</p>
		</div>
		<div class="flex flex-col gap-2">
			<p>
				<span class="font-semibold">Channel:</span>
				{channels.find((c) => c.value === lb.channelId)?.label ?? 'Not Set'}
			</p>
			<p>
				<span class="font-semibold">Updates:</span>
				{channels.find((c) => c.value === lb.updateChannelId)?.label ?? 'Not Set'}
			</p>
			<p>
				<span class="font-semibold">Update Role:</span>
				@{roles.find((c) => c.value === lb.updateRoleId)?.label ?? 'Not Set'}
			</p>
		</div>
		<div class="flex flex-col gap-2">
			<p>
				<span class="font-semibold">Required Role:</span>
				@{roles.find((c) => c.value === lb.requiredRole)?.label ?? 'Not Set'}
			</p>
			<p>
				<span class="font-semibold">Banned Role:</span>
				@{roles.find((c) => c.value === lb.blockedRole)?.label ?? 'Not Set'}
			</p>
		</div>
		<div class="flex flex-col justify-between gap-2">
			<!-- <Button class="edit" href="?/edit/{lb.id}" color="green">
				<GearSolid />
				<Popover triggeredBy=".edit" placement="left">
					<p>Edit Leaderboard</p>
				</Popover>
			</Button> -->
			<form method="post" action="{$page.url.pathname}?/send" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button type="submit" color="green">
							<Mail />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Send Leaderboard in Discord</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</form>
			<form method="post" action="{$page.url.pathname}?/clear" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button type="submit" color="yellow">
							<RefreshCcw />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Clear all scores, but they can be submitted again</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</form>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button on:click={() => (confirmModal = true)} color="red">
						<Trash2 />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Delete Leaderboard</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>

	{#if crops.length > 0}
		<Accordion.Root>
			{#each crops as [crop, entries] (crop)}
				<Accordion.Item value={crop}>
					<Accordion.Trigger class="py-2">
						<p class="text-lg first-letter:capitalize">
							{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)}
						</p>
					</Accordion.Trigger>
					<Accordion.Content>
						{#each entries as entry (entry)}
							<div class="flex items-center flex-row gap-8 my-2">
								<form method="POST" action="{$page.url.pathname}?/banparticipation" use:enhance>
									<input type="hidden" name="id" value={lb.id} />
									<input type="hidden" name="uuid" value={entry.uuid} />
									<input type="hidden" name="crop" value={entry.record?.crop} />
									<input type="hidden" name="time" value={entry.record?.timestamp} />
									<Tooltip.Root>
										<Tooltip.Trigger>
											<Button type="submit" variant="destructive" size="icon">
												<Trash2 size={20} />
											</Button>
										</Tooltip.Trigger>
										<Tooltip.Content side="right">
											<p>Remove and block this Participation</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</form>
								<p class="text-lg">{entry.ign}</p>
								<p class="text-lg font-mono">{entry.record?.collected?.toLocaleString()}</p>
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
			<form method="POST" action="{$page.url.pathname}?/delete" use:enhance>
				<input type="hidden" name="id" value={lb.id} />
				<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
