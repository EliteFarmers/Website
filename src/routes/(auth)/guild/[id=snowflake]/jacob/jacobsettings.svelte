<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import { Accordion, AccordionItem, Button, Card, Modal, Popover } from 'flowbite-svelte';
	import { GearSolid, MailBoxSolid, TrashBinSolid } from 'flowbite-svelte-icons';

	export let lb: components['schemas']['GuildJacobLeaderboard'];
	export let channels: { value: string; name: string }[];
	export let roles: { value: string; name: string }[];

	$: crops = {
		cactus: lb.cactus ?? [],
		carrot: lb.carrot ?? [],
		potato: lb.potato ?? [],
		wheat: lb.wheat ?? [],
		melon: lb.melon ?? [],
		pumpkin: lb.pumpkin ?? [],
		mushroom: lb.mushroom ?? [],
		'Cocoa Beans': lb.cocoaBeans ?? [],
		'Sugar Cane': lb.sugarCane ?? [],
		'Nether Wart': lb.netherWart ?? [],
	};

	let confirmModal = false;
</script>

<div
	class="flex flex-col justify-between gap-4 p-4 rounded-md bg-gray-100 dark:bg-zinc-800 w-full rounded-lgs"
>
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
				{channels.find((c) => c.value === lb.channelId)?.name ?? 'Not Set'}
			</p>
			<p>
				<span class="font-semibold">Updates:</span>
				{channels.find((c) => c.value === lb.updateChannelId)?.name ?? 'Not Set'}
			</p>
			<p>
				<span class="font-semibold">Update Role:</span>
				@{roles.find((c) => c.value === lb.updateRoleId)?.name ?? 'Not Set'}
			</p>
		</div>
		<div class="flex flex-col gap-2">
			<p>
				<span class="font-semibold">Required Role:</span>
				@{roles.find((c) => c.value === lb.requiredRole)?.name ?? 'Not Set'}
			</p>
			<p>
				<span class="font-semibold">Banned Role:</span>
				@{roles.find((c) => c.value === lb.blockedRole)?.name ?? 'Not Set'}
			</p>
		</div>
		<div class="flex flex-col justify-between gap-2">
			<Button class="edit" href="?/edit/{lb.id}" color="green">
				<GearSolid />
				<Popover triggeredBy=".edit" placement="left">
					<p>Edit Leaderboard</p>
				</Popover>
			</Button>
			<Button class="send" href="?/edit/{lb.id}" color="yellow">
				<MailBoxSolid />
				<Popover triggeredBy=".send" placement="left">
					<p>Send Leaderboard in Discord</p>
				</Popover>
			</Button>
			<Button class="delete" on:click={() => (confirmModal = true)} color="red">
				<TrashBinSolid />
				<Popover triggeredBy=".delete" placement="left">
					<p>Send Leaderboard in Discord</p>
				</Popover>
			</Button>
		</div>
	</div>

	{#if Object.values(crops).some(a => a.length > 0)}
		<Accordion flush={true}>
			{#each Object.entries(crops) as [crop, entries] (crop)}
				<AccordionItem paddingFlush="p-2">
					<span slot="header" class="text-lg first-letter:capitalize">{crop}</span>
					{#each entries as entry (entry)}
						<div class="flex flex-row justify-between">
							<p>{entry.ign}</p>
							<p>{entry.record?.collected}</p>
						</div>
					{/each}
				</AccordionItem>
			{/each}
		</Accordion>
	{:else}
		<p class="text-center">No scores submitted yet</p>
	{/if}
</div>

<Modal bind:open={confirmModal} size="xs">
	<div class="text-center my-5">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Are you sure you want to delete this leaderboard?
		</h3>
		<div class="flex flex-row items-center justify-center">
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={lb.id} />
				<Button color="red" class="mr-2" type="submit">Yes, I'm sure</Button>
			</form>
			<Button color="alternative" on:click={() => (confirmModal = false)}>No, cancel</Button>
		</div>
	</div>
</Modal>
