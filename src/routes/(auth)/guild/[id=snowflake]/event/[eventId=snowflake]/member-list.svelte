<script lang="ts">
	import { enhance } from '$app/forms';
	import TeamNameSelector from '$comp/events/team-name-selector.svelte';
	import type { EventDetailsDto, EventTeamWithMembersDto, EventTeamsWordListDto } from '$lib/api';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import SelectSimple from '$ui/select/select-simple.svelte';
	import { getColumns, type AdminEventMember } from './columns.js';
	import MemberTable from './data-table.svelte';

	interface Props {
		event: EventDetailsDto;
		members: AdminEventMember[];
		teams: EventTeamWithMembersDto[] | undefined;
		teamWords?: EventTeamsWordListDto;
	}

	let { members, teams, event, teamWords }: Props = $props();

	let teamLookup = $derived.by(() => {
		if (!teams) return [] as EventTeamWithMembersDto[];
		return Object.fromEntries(
			teams.map((team) => {
				return [team.id, team];
			})
		) as Record<number, EventTeamWithMembersDto>;
	});

	let pending = $state(false);
	let banMemberModal = $state(false);
	let unbanMemberModal = $state(false);
	let promoteMemberModal = $state(false);
	let teamKickModal = $state(false);
	let addToTeamModal = $state(false);
	let deleteTeamModal = $state(false);
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
			promote: (member) => {
				promoteMemberModal = true;
				selectedMember = member;
			},
			teamkick: (member) => {
				teamKickModal = true;
				selectedMember = member;
			},
			addtoteam: (member) => {
				addToTeamModal = true;
				selectedMember = member;
			},
			deleteteam: (member) => {
				deleteTeamModal = true;
				selectedMember = member;
			},
		})
	);

	let teamOptions = $derived(
		(teams ?? [])
			.filter(
				(t) =>
					t.members &&
					event &&
					event.maxTeamMembers &&
					(t.members?.length < event.maxTeamMembers || event.maxTeamMembers === -1)
			)
			.map((t) => ({
				value: t.id ?? '',
				label:
					(t.name ?? '') +
					` (${t.members?.length}${event?.maxTeamMembers === -1 ? '' : `/${event?.maxTeamMembers}`})`,
			}))
	);
</script>

<div class="w-full max-w-6xl rounded-md border-2 p-4">
	<MemberTable
		data={members}
		{columns}
		initialSorting={[{ id: 'score', desc: true }]}
		initialVisibility={{ teamId: event.mode !== 'solo' }}
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

				<p class="text-muted-foreground mt-2 text-sm">
					This will remove {selectedMember.playerName} from the event and ban them from rejoining. This action
					is reversible. Ban reasons are visible to the player.
				</p>

				<div class="space-y-2">
					<Label>Ban Reason</Label>
					<Input name="reason" placeholder="Cheating - Macro" maxlength={64} required />
				</div>

				<Button type="submit" disabled={pending} class="w-fit">Ban</Button>
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

				<p class="text-muted-foreground mt-2 text-sm">
					This will add {selectedMember.playerName} back to the event and remove their ban.
				</p>

				<Button type="submit" disabled={pending} class="w-fit">Unban</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={promoteMemberModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Transfer Team Ownership to {selectedMember?.playerName}</Dialog.Title>
		{#if selectedMember}
			<form
				method="post"
				action="?/promoteMember"
				class="flex flex-col gap-2"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						if (result) promoteMemberModal = false;
						pending = false;
						update();
					};
				}}
			>
				<input type="hidden" name="id" value={event.id} />
				<input type="hidden" name="team" value={selectedMember.teamId} />
				<input type="hidden" name="member" value={selectedMember.playerUuid} />

				<p class="text-muted-foreground mt-2 text-sm">
					This will set {selectedMember.playerName} as the new owner of the team.
				</p>

				<Button type="submit" disabled={pending} class="w-fit">Set Ownership</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={teamKickModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Kick {selectedMember?.playerName} From Team</Dialog.Title>
		{#if selectedMember}
			<form
				method="post"
				action="?/kickTeamMember"
				class="flex flex-col gap-2"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						if (result) teamKickModal = false;
						pending = false;
						update();
					};
				}}
			>
				<input type="hidden" name="id" value={event.id} />
				<input type="hidden" name="team" value={selectedMember.teamId} />
				<input type="hidden" name="member" value={selectedMember.playerUuid} />

				<p class="text-muted-foreground mt-2 text-sm">
					This will remove {selectedMember.playerName} from the team.
				</p>

				<Button type="submit" disabled={pending} class="w-fit">Kick</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={deleteTeamModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Delete Team</Dialog.Title>
		{#if selectedMember}
			<form
				method="post"
				action="?/deleteTeam"
				class="flex flex-col gap-2"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						if (result) deleteTeamModal = false;
						pending = false;
						update();
					};
				}}
			>
				<input type="hidden" name="id" value={event.id} />
				<input type="hidden" name="team" value={selectedMember.teamId} />

				<p class="text-muted-foreground mt-2 text-sm">This will delete the team and remove members in it.</p>

				<Button type="submit" disabled={pending} class="w-fit" variant="destructive">Delete</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={addToTeamModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Add {selectedMember?.playerName} to a Team</Dialog.Title>
		{#if selectedMember}
			<div class="mx-2 flex flex-col gap-2">
				<form
					method="post"
					action="?/addMemberToTeam"
					class="flex flex-col gap-4"
					use:enhance={() => {
						pending = true;
						return async ({ result, update }) => {
							if (result) addToTeamModal = false;
							pending = false;
							update();
						};
					}}
				>
					<input type="hidden" name="id" value={event.id} />
					<input type="hidden" name="member" value={selectedMember.playerUuid} />

					<SelectSimple options={teamOptions} name="team" placeholder="Select Team" required class="mt-4" />

					<Button type="submit" disabled={pending} class="w-fit">Add Member To Team</Button>
				</form>

				<hr />

				<form
					method="post"
					action="?/createTeam"
					class="flex flex-col gap-4"
					use:enhance={() => {
						pending = true;
						return async ({ result, update }) => {
							if (result) addToTeamModal = false;
							pending = false;
							update();
						};
					}}
				>
					<input type="hidden" name="id" value={event.id} />
					<input type="hidden" name="member" value={selectedMember.accountId} />

					<div class="space-y-2">
						<Label>Create New team</Label>
						<TeamNameSelector words={teamWords} />
					</div>

					<Button type="submit" disabled={pending} class="w-fit">Create Team</Button>
				</form>
			</div>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>
