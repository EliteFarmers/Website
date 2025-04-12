<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getColumns, type AdminEventMember } from './columns.js';
	import MemberTable from './data-table.svelte';
	import * as Dialog from '$ui/dialog';
	import { enhance } from '$app/forms';
	import { Label } from '$ui/label';
	import { Input } from '$ui/input';
	import { Button } from '$ui/button';

	interface Props {
		event: components['schemas']['EventDetailsDto'];
		members: AdminEventMember[];
		teams: components['schemas']['EventTeamWithMembersDto'][] | undefined;
	}

	let { members, teams, event }: Props = $props();

	let teamLookup = $derived.by(() => {
		if (!teams) return [] as components['schemas']['EventTeamWithMembersDto'][];
		return Object.fromEntries(
			teams.map((team) => {
				return [team.id, team];
			})
		) as Record<number, components['schemas']['EventTeamWithMembersDto']>;
	});

	let pending = $state(false);
	let banMemberModal = $state(false);
	let unbanMemberModal = $state(false);
	let selectedMember = $state<AdminEventMember | null>(null);

	const columns = $derived(
		getColumns(teamLookup, {
			ban: (member) => {
				banMemberModal = true;
				selectedMember = member;
			},
			unban: (member) => {
				unbanMemberModal = true;
				selectedMember = member;
			},
		})
	);
</script>

<div class="w-full max-w-6xl rounded-md border-2 p-4">
	<MemberTable
		data={members}
		{columns}
		initialSorting={[{ id: 'score', desc: true }]}
		initialVisibility={{ teamId: !!teams?.length }}
	/>
</div>

<Dialog.Root bind:open={banMemberModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Ban {selectedMember?.playerName} From Event</Dialog.Title>
		{#if selectedMember}
			<form
				method="post"
				action="?/banmember"
				class="flex flex-col gap-2"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						if (result) banMemberModal = false;
						pending = false;
						update();
					};
				}}
			>
				<input type="hidden" name="id" value={event.id} />
				<input type="hidden" name="uuid" bind:value={selectedMember.playerUuid} />

				<p class="mt-2 text-sm text-muted-foreground">
					This will remove {selectedMember.playerName} from the event and ban them from rejoining. This action
					is reversible. Ban reasons are visible to the player.
				</p>

				<div class="space-y-2">
					<Label>Ban Reason</Label>
					<Input name="reason" placeholder="Cheating - Macro" maxlength={64} required />
				</div>

				<Button type="submit" disabled={pending}>Ban</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={unbanMemberModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Unban {selectedMember?.playerName} From Event</Dialog.Title>
		{#if selectedMember}
			<form
				method="post"
				action="?/unbanmember"
				class="flex flex-col gap-2"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						if (result) unbanMemberModal = false;
						pending = false;
						update();
					};
				}}
			>
				<input type="hidden" name="id" value={event.id} />
				<input type="hidden" name="uuid" bind:value={selectedMember.playerUuid} />

				<p class="mt-2 text-sm text-muted-foreground">
					This will add {selectedMember.playerName} back to the event and remove their ban.
				</p>

				<Button type="submit" disabled={pending}>Unban</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>
