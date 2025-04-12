<script lang="ts">
	import { Button } from '$ui/button';
	import * as Checkbox from '$ui/checkbox';
	import * as Popover from '$ui/popover';
	import * as Dialog from '$ui/dialog';
	import * as Tooltip from '$ui/tooltip';
	import { Label } from '$ui/label';
	import type { ActionData, PageData } from './$types';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { EventType } from '$lib/utils';
	import { Input } from '$ui/input';
	import { SelectSimple } from '$ui/select';
	import Check from 'lucide-svelte/icons/check';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Crown from 'lucide-svelte/icons/crown';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { invalidate } from '$app/navigation';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import VisibleToggle from '$comp/visible-toggle.svelte';
	import type { components } from '$lib/api/api';
	import TeamNameSelector from '$comp/events/team-name-selector.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let checks = $state({
		1: false,
		2: false,
		3: false,
		4: false,
		5: false,
	});

	let kickMemberModal = $state(false);
	let promoteMemberModal = $state(false);
	let selectedMember = $state<components['schemas']['EventMemberDetailsDto']>();

	let event = $derived(data.event);
	let teams = $derived(
		(data.teams ?? [])
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

	let joined = $derived(data.member && (data.member?.status === 0 || data.member?.status === 1));
	let ownTeamId = $derived(+(data.member?.teamId ?? '0'));
	let ownTeam = $derived(data.team);
	let isOwner = $derived(ownTeam?.ownerId === data.account?.discordId);
	let profiles = $derived(
		data.account?.profiles?.filter((p) => p.members?.some((m) => m.active && m.uuid === data.account?.id)) ?? []
	);

	let joinEnds = $derived(+(event.joinUntilTime ?? 0) * 1000);
	let joinable = $derived(joinEnds > Date.now() && !data.member?.disqualified);
	let loading = $state(false);

	let codeVisible = $state(false);

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Events',
			href: '/browse',
		},
		{
			name: event.name,
			href: `/event/${page.params.event}`,
		},
		{
			name: 'Membership',
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});

	const favorites = getFavoritesContext();
	favorites.setPage({
		icon: data.guild?.icon?.url ?? undefined,
		name: (data.event.name ?? 'Event') + ' Membership',
		href: page.url.pathname,
	});
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<h1 class="mt-16 text-4xl font-semibold">Manage Event Membership</h1>

	<Button class="my-8 flex-1" href="/event/{page.params.event}" variant="secondary">Back To Event</Button>

	{#if !data.account}
		<p>You have no Minecraft accounts linked to your account.</p>
		<p>Login and link your Minecraft account <a href="/profile" class="text-link">here</a> first.</p>
	{/if}

	{#if form?.error}
		<h5 class="mb-4 max-w-xl text-xl font-semibold text-destructive">
			{form?.error}
		</h5>
	{/if}

	<div class="flex flex-col items-start justify-center gap-3 md:flex-row md:gap-8">
		<form
			method="post"
			action="?/join"
			class="mb-16 flex max-w-lg flex-col gap-4 rounded-md border-2 bg-card p-8"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<h2 class="mb-4 text-center text-2xl font-semibold">
				{#if event.mode === 'solo'}
					Join Event
				{:else}
					Step 1: Join Event
				{/if}
			</h2>
			<p>
				Choose the profile you want to join the event with.
				<span class="text-destructive">This can't be changed later on!</span>
			</p>

			{#each profiles as profile (profile)}
				{#if data.member && profile.profileId === data.member.profileId}
					<div class="flex flex-row items-center gap-2">
						<Check class="text-progress" />
						<p>
							{profile.profileName} - {profile.members
								?.find((m) => m.uuid === data.account?.id)
								?.farmingWeight?.toLocaleString()} Farming Weight
						</p>
					</div>
				{:else if !data.member}
					<div class="flex flex-row items-center gap-2">
						<input type="radio" name="profile" value={profile.profileId} required class="h-4 w-4" />
						<p>
							{profile.profileName} - {profile.members
								?.find((m) => m.uuid === data.account?.id)
								?.farmingWeight?.toLocaleString()} Farming Weight
						</p>
					</div>
				{/if}
			{/each}

			<h3 class="mt-2 text-lg font-semibold">How is progress counted?</h3>
			{#if data.event.type === +EventType.FarmingWeight}
				<p>
					To prevent the use of minions to gain collection progress, the event will only count progress made
					through the use of farming tools. <span class="text-destructive"
						>You must have collections and inventory API access enabled at all times.</span
					> If you do turn them off, you will be automatically removed from the event.
				</p>
				<p>
					Collection gain is cross checked with your tool usage. If you gain collection progress without using
					a tool, it will not count towards your progress. This also means a Daedalus Axe won't count either,
					as there's no way to differentiate it from minions.
				</p>
				<p class="text-destructive">
					Tools that do not have a built in counter require the Cultivating enchantment or your progress with
					that tool will not be counted.
				</p>
				<p class="text-muted-foreground">
					The only valid tools are the specific farming tools. Normal hoes and other beginner tools will not
					count.
				</p>
			{:else if data.event.type === +EventType.Medals}
				<p>
					It's simple, just earn Jacob Contest placements! Make sure to claim your contests in game for them
					to count.
				</p>
				<p>
					<span class="text-destructive"
						>You must have collections and inventory API access enabled at all times.</span
					> If you do turn either of them off, you will be automatically removed from the event.
				</p>
			{:else if data.event.type === +EventType.Pests}
				<p>Just kill pests! The event will count the amount of pests you kill.</p>
				<p>
					<span class="text-destructive">You must have collections API access enabled at all times.</span>
					If you do turn it off, you will be automatically removed from the event.
				</p>
			{:else if data.event.type === +EventType.Collections}
				<p>
					Just collect items! The event lists what items will count towards your progress. You can find the
					items in the event description.
				</p>
				<p>
					<span class="text-destructive">You must have collections API access enabled at all times.</span>
					If you do turn it off, you will be automatically removed from the event.
				</p>
			{/if}

			<div class="mt-8 flex items-center gap-2">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[1]} />
				{#if joined}
					<Checkbox.Root checked={true} disabled />
				{:else}
					<Checkbox.Root bind:checked={checks[1]} />
				{/if}
				<Label>
					I confirm that I have read all of <a href="https://hypixel.net/rules" class="text-link underline">
						Hypixel's Server Rules
					</a> and that I agree to them.
				</Label>
			</div>

			<div class="flex items-center gap-2">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[2]} />
				{#if joined}
					<Checkbox.Root checked={true} disabled />
				{:else}
					<Checkbox.Root bind:checked={checks[2]} />
				{/if}
				<Label>I confirm that I have read the event's rules and disclaimers and that I agree to them.</Label>
			</div>

			<div class="flex items-center gap-2">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[3]} />
				{#if joined}
					<Checkbox.Root checked={true} disabled />
				{:else}
					<Checkbox.Root bind:checked={checks[3]} />
				{/if}
				<Label>
					I confirm that I have read the rules of the related Discord Server and that I agree to them.
				</Label>
			</div>

			<div class="flex items-center gap-2">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[4]} />
				{#if joined}
					<Checkbox.Root checked={true} disabled />
				{:else}
					<Checkbox.Root bind:checked={checks[4]} />
				{/if}
				<Label>
					I understand that I may be removed from the event at any time for breaking any rules, or appearing
					to break them at the discretion of the event moderators.
				</Label>
			</div>

			<div class="mb-8 flex items-center gap-2">
				<input type="checkbox" name="confirm" value="true" hidden required bind:checked={checks[5]} />
				{#if joined}
					<Checkbox.Root checked={true} disabled />
				{:else}
					<Checkbox.Root bind:checked={checks[5]} />
				{/if}
				<Label>
					I understand that I am responsible for my own actions and that the event organizers are not
					responsible for any harm that may come to me or my account during the event. For example, skipping
					sleep to play the event is not recommended and is at your own risk.
				</Label>
			</div>

			<div class="flex flex-col justify-center gap-2 md:flex-row">
				<Button class="flex-1" type="submit" disabled={joined || loading}>Join Event</Button>
			</div>

			{#if joined}
				<p class="text-progress">You have successfully joined the event!</p>
			{/if}
		</form>
		{#if event.mode !== 'solo'}
			<div class="mb-16 flex max-w-lg flex-col gap-4 rounded-md border-2 bg-card p-8">
				<h2 class="mb-4 text-center text-2xl font-semibold">Step 2: Join Team</h2>
				<p>
					This is a team event! You must join a team to participate. If you don't have a team, you can create
					one below (if the event allows it). <span class="font-semibold"
						>You won't be able to change your team or kick members once the join period ends!</span
					>
				</p>
				<p>
					{#if joinable}
						<span class="text-muted-foreground">Joining Closes</span>
					{:else}
						<span class="text-muted-foreground">Joining Closed</span>
					{/if}
					{new Date(joinEnds).toLocaleDateString()}
					{new Date(joinEnds).toLocaleTimeString(undefined, {
						hour: 'numeric',
						minute: '2-digit',
					})}
				</p>

				{#if ownTeam}
					<div class="my-8 flex flex-col gap-4">
						<h3 class="text-xl">
							Your Team: <span class="font-semibold">{ownTeam.name}</span>
						</h3>
						{#if ownTeam.joinCode}
							<div class="flex flex-row items-center gap-2">
								<p>Join Code</p>
								<VisibleToggle bind:visible={codeVisible} variant="outline" />
								<input
									class="max-w-24 rounded-md border bg-background p-1 text-center font-mono font-semibold"
									type={!codeVisible ? 'password' : 'text'}
									disabled
									value={ownTeam.joinCode}
								/>
								<CopyToClipboard text={ownTeam.joinCode} class="size-8" variant="outline" />
							</div>
						{/if}
						{#each ownTeam.members ?? [] as member (member.playerUuid)}
							<div class="flex flex-row justify-between">
								<div class="flex flex-row items-center gap-2">
									<img
										src="https://mc-heads.net/avatar/{member.playerUuid}"
										alt="Player Head"
										class="pixelated aspect-square h-8 w-8 rounded-sm"
									/>
									<p>{member.playerName}</p>
									{#if ownTeam.ownerUuid === member.playerUuid}
										<Popover.Mobile>
											{#snippet trigger()}
												<div class="flex flex-row items-end">
													<Crown size="sm" class="mt-1.5 w-4 text-completed" />
												</div>
											{/snippet}
											<p>Team Owner</p>
										</Popover.Mobile>
									{/if}
								</div>
								<div class="flex flex-row items-center gap-2">
									<p class="font-semibold">{(+(member.score ?? 0)).toLocaleString()}</p>
									{#if isOwner && member.playerUuid !== data.account?.id}
										<Tooltip.Simple>
											{#snippet child({ props })}
												<Button
													type="submit"
													disabled={loading}
													{...props}
													class="ml-1 size-8"
													size="sm"
													variant="outline"
													onclick={() => {
														selectedMember = member;
														promoteMemberModal = true;
													}}
												>
													<Crown class="text-completed" />
												</Button>
											{/snippet}
											<p>Transfer Ownership</p>
										</Tooltip.Simple>
										<Tooltip.Simple>
											{#snippet child({ props })}
												<Button
													type="submit"
													disabled={loading}
													{...props}
													class="size-8"
													size="sm"
													variant="outline"
													onclick={() => {
														selectedMember = member;
														kickMemberModal = true;
													}}
												>
													<Trash class="text-destructive" />
												</Button>
											{/snippet}
											<p>Kick From Team</p>
										</Tooltip.Simple>
									{/if}
								</div>
							</div>
						{/each}
						<form
							action="?/leaveTeam"
							method="post"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									await update();
									loading = false;
								};
							}}
						>
							<input type="hidden" name="team" value={ownTeamId} />
							<Button type="submit" variant="secondary" formaction="?/leaveTeam" disabled={loading}
								>Leave Team</Button
							>
						</form>
					</div>

					{#if isOwner}
						<form
							action="?/updateTeam"
							method="post"
							class="flex flex-col gap-4"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									await update();
									loading = false;
								};
							}}
						>
							<input type="hidden" name="team" value={ownTeamId} />
							<h3 class="text-xl font-semibold">Update Your Team</h3>
							<p>Change the name of your team!</p>
							<div class="flex flex-row items-center gap-2 text-primary">
								<TeamNameSelector words={data.words} bind:loading />
							</div>
							<div class="flex flex-row gap-2">
								<Button type="submit" disabled={loading}>Update Team Name</Button>
								<Button type="submit" formaction="?/newCode" variant="secondary" disabled={loading}
									>Reset Join Code</Button
								>
							</div>
						</form>
					{/if}
				{:else}
					<form action="?/joinTeam" method="post" class="my-8 flex flex-col gap-4" use:enhance>
						<h3 class="text-xl font-semibold">Join a Team</h3>
						<p>Get the code from your team leader!</p>
						<div class="flex flex-row items-center gap-2">
							<SelectSimple options={teams} name="team" placeholder="Select Team" required />
							<Input type="text" name="code" placeholder="Join Code" required />
						</div>
						<Button type="submit" disabled={!data.member || !joined || loading}>Join Team</Button>
						{#if !joined}
							<p class="-mt-2 leading-none text-destructive">Join the event first to join a team!</p>
						{/if}
					</form>

					<form
						action="?/createTeam"
						method="post"
						class="flex flex-col gap-4"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								invalidate('event:membership');
								await update();
								loading = false;
							};
						}}
					>
						<h3 class="text-xl font-semibold">Create a Team</h3>
						<p>
							Create your own team for players to join! Names are generated below with an approved word
							list.
						</p>
						<div class="flex flex-row items-center gap-2 text-primary">
							<div class="flex flex-col gap-2">
								<TeamNameSelector words={data.words} bind:loading />
							</div>
						</div>
						<Button type="submit" disabled={!data.member || !joined || loading}>Create Team</Button>
						{#if !joined}
							<p class="-mt-2 leading-none text-destructive">Join the event first to create a team!</p>
						{/if}
					</form>
				{/if}
			</div>
		{/if}
	</div>

	<form method="post" action="?/leave" class="my-8 mb-16 max-w-xl" use:enhance>
		<div class="flex flex-row items-center justify-center gap-2">
			<p>Already joined?</p>
			<Button type="submit" variant="destructive" disabled={!joined || loading}>Leave Event</Button>
		</div>
		<p class="mt-2 text-center">
			Leaving the event will remove you from the leaderboard. Be sure you want to leave before doing so. There is
			no confirmation.
		</p>
	</form>
</div>

<Dialog.Root bind:open={kickMemberModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Kick {selectedMember?.playerName} From Team?</Dialog.Title>
		{#if selectedMember}
			<form
				action="?/kickMember"
				class="mt-4"
				method="post"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						kickMemberModal = false;
					};
				}}
			>
				<input type="hidden" name="team" value={ownTeamId} />
				<input type="hidden" name="member" value={selectedMember.playerUuid} />
				<p class="mb-4">
					A kicked member can rejoin your team if they still have the join code! Consider changing it
					afterwards.
				</p>
				<Button
					type="submit"
					size="sm"
					variant="destructive"
					disabled={selectedMember.playerUuid === data.account?.id || loading}
				>
					<Trash /> Kick Member
				</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={promoteMemberModal}>
	<Dialog.ScrollContent>
		<Dialog.Title>Transfer team to {selectedMember?.playerName}?</Dialog.Title>
		{#if selectedMember}
			<form
				action="?/transferOwnership"
				class="mt-4"
				method="post"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						promoteMemberModal = false;
					};
				}}
			>
				<input type="hidden" name="team" value={ownTeamId} />
				<input type="hidden" name="member" value={selectedMember.playerUuid} />
				<p class="mb-4">
					Transferring ownership to {selectedMember.playerName} will remove your permissions! They will be able
					to kick you if you do this, and you will lose control over the team!
				</p>
				<Button
					type="submit"
					size="sm"
					variant="destructive"
					disabled={selectedMember.playerUuid === data.account?.id || loading}
				>
					<Crown /> Transfer Ownership
				</Button>
			</form>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>
