<script lang="ts">
	import { page } from '$app/state';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import Head from '$comp/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { getReadableSkyblockDate } from '$lib/format';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import {
		banJacobLeaderboardPlayer,
		banJacobTimespan,
		createJacobLeaderboardForm,
		unbanJacobLeaderboardPlayer,
		unbanJacobParticipationForm,
		unbanJacobTimespan,
	} from '$lib/remote/jacob.remote';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { ChannelType } from '$lib/utils';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Checkbox } from '$ui/checkbox';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { getCropDisplayName, getCropFromName } from 'farming-weight';
	import type { PageData } from './$types';
	import Jacobsettings from './jacobsettings.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let clickOutsideModal = $state(false);

	function resetCreateFormFields() {
		createJacobLeaderboardForm.fields.set({
			title: '',
			sendToChannelId: undefined,
			enableUpdates: false,
			mentionRoleId: undefined,
			updatesChannelId: undefined,
			tinyUpdatesPing: false,
			requiredRoleId: undefined,
			blockedRoleId: undefined,
			startDate: undefined,
			endDate: undefined,
		});
	}

	let channels = $derived(
		(data.guild?.channels ?? [])
			// Only allow text channels
			.filter((c) => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
			.map((c) => ({
				value: c.id ?? '',
				label: '#' + (c.name ?? ''),
			}))
			.filter((c) => c.value)
	);

	let roles = $derived(
		(data.guild?.roles ?? [])
			.map((r) => ({
				value: r.id ?? '',
				label: '@' + (r.name ?? ''),
			}))
			.filter((r) => r.value && r.label !== '@@everyone')
	);

	let excluded = $derived(
		(data.excludedParticipations ?? []).map((p) => {
			const [timestamp, crop, uuid] = p.split('-');
			return { timestamp, crop, uuid };
		})
	);

	let bannedPlayers = $derived(data.blockedPlayerUuids ?? []);

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Servers',
			href: '/profile/servers',
		},
		{
			name: data.guild.name,
			href: `/guild/${data.guild.id}`,
		},
		{
			name: 'Jacob',
		},
	]);

	const breadcrumb = getPageCtx();
	const favorites = getFavoritesContext();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
		favorites.setPage({
			icon: data.guild.icon?.url ?? undefined,
			name: 'Jacob Leaderboards',
			href: page.url.pathname,
		});
	});

	let formError = $derived(
		createJacobLeaderboardForm.result?.error ||
			banJacobTimespan.result?.error ||
			unbanJacobTimespan.result?.error ||
			unbanJacobParticipationForm.result?.error ||
			banJacobLeaderboardPlayer.result?.error ||
			unbanJacobLeaderboardPlayer.result?.error
	);
</script>

<Head title="Jacob Leaderboards" description="Manage Jacob Leaderboards for your guild" />

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{data.guild?.name}
		</h1>
	</div>

	<section class="flex flex-col gap-4">
		<p class="text-lg">
			You have {data.leaderboards?.length ?? 0} / {data.maxLeaderboards} available Jacob Leaderboards created
		</p>
		{#if (data.leaderboards?.length ?? 0) < (data.maxLeaderboards ?? 0)}
			<div class="flex w-full items-center justify-center">
				<Button onclick={() => (clickOutsideModal = true)}>Create New</Button>
			</div>
		{/if}
	</section>

	{#if formError}
		<h5 class="text-destructive text-xl font-semibold">
			<p>{typeof formError === 'string' ? formError : JSON.stringify(formError, null, 2)}</p>
		</h5>
	{/if}

	<section class="flex w-full flex-col items-center justify-center gap-8">
		<div class="bg-card flex w-full max-w-4xl flex-col justify-center justify-items-center rounded-md border-2">
			<h2 class="p-4 text-2xl">Manage Shared Settings</h2>
			<Accordion.Root class="mx-4" type="multiple">
				<Accordion.Item value="banned">
					<Accordion.Trigger>
						<h4>Banned Participations</h4>
					</Accordion.Trigger>
					<Accordion.Content>
						{#if (data.excludedParticipations ?? []).length > 0}
							<div class="flex flex-col gap-4">
								{#each excluded as p (p)}
									{@const unbanParticipation = unbanJacobParticipationForm.for(
										`${p.timestamp}-${p.crop}-${p.uuid}-unban`
									)}
									<div class="flex flex-row items-center gap-4">
										<form {...unbanParticipation}>
											<input
												{...unbanParticipation.fields.participationId.as('text')}
												value="{p.timestamp}-{p.crop}-{p.uuid}"
												hidden
											/>
											<Button
												type="submit"
												size="sm"
												variant="destructive"
												disabled={!!unbanParticipation.pending}
											>
												<Trash2 size={16} />
											</Button>
										</form>
										<PlayerHead uuid={p.uuid} size="lg" />
										<p>{getCropDisplayName(getCropFromName(p.crop))}</p>
										<p>{getReadableSkyblockDate(p.timestamp)}</p>
										<Button size="sm" href="/contest/{p.timestamp}" color="alternative">View</Button
										>
									</div>
								{/each}
							</div>
						{:else}
							<p class="p-4">No participations are blocked from being on Jacob Leaderboards</p>
						{/if}
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="bannedPlayers">
					<Accordion.Trigger>
						<h4>Banned Players</h4>
					</Accordion.Trigger>
					<Accordion.Content>
						{#if bannedPlayers.length > 0}
							<div class="flex flex-col gap-4">
								{#each bannedPlayers as uuid (uuid)}
									{@const unbanPlayer = unbanJacobLeaderboardPlayer.for(uuid + '-unban')}
									<div class="flex flex-row items-center gap-4">
										<form {...unbanPlayer}>
											<input
												type="text"
												{...unbanPlayer.fields.uuid.as('text')}
												value={uuid}
												hidden
											/>
											<Button
												type="submit"
												size="sm"
												variant="destructive"
												disabled={!!unbanPlayer.pending}
											>
												<Trash2 size={16} />
											</Button>
										</form>
										<PlayerHead {uuid} size="lg" />
										<a class="font-mono hover:underline" href="/@{uuid}">{uuid}</a>
									</div>
								{/each}
							</div>
						{:else}
							<p class="p-4">No players are currently banned from Jacob Leaderboards</p>
						{/if}
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="ranges">
					<Accordion.Trigger>
						<h4>Excluded Time Spans</h4>
					</Accordion.Trigger>
					<Accordion.Content>
						{#if (data.excludedTimespans ?? []).length > 0}
							<div class="flex flex-col gap-4">
								{#each data.excludedTimespans ?? [] as t (t)}
									{@const unbanTimespan = unbanJacobTimespan.for(`${t.start}-${t.end}`)}
									<div class="flex flex-row items-center gap-4">
										<form {...unbanTimespan}>
											<input
												type="text"
												{...unbanTimespan.fields.startTime.as('text')}
												value={t.start}
												hidden
											/>
											<input
												type="text"
												{...unbanTimespan.fields.endTime.as('text')}
												value={t.end}
												hidden
											/>
											<Button
												type="submit"
												size="sm"
												variant="destructive"
												disabled={!!unbanTimespan.pending}
											>
												<Trash2 size={16} />
											</Button>
										</form>
										<div class="flex flex-col gap-8 md:flex-row">
											<div class="flex flex-col gap-2">
												<p>{new Date(Number(t.start ?? 0) * 1000).toLocaleDateString()}</p>
												<p>{getReadableSkyblockDate(t.start ?? 0)}</p>
											</div>
											<div class="flex flex-col gap-2">
												<p>{new Date(Number(t.end ?? 0) * 1000).toLocaleDateString()}</p>
												<p>{getReadableSkyblockDate(t.end ?? 0)}</p>
											</div>
										</div>
										<p>{t.reason ?? 'No reason provided'}</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="p-4">No time spans are excluded from being on Jacob Leaderboards</p>
						{/if}
						<form {...banJacobTimespan}>
							<div class="mt-8 flex flex-col items-center gap-4 md:flex-row">
								<div class="flex flex-1 flex-col items-start gap-1">
									<Label for="startDate">Start Time</Label>
									<Input
										{...banJacobTimespan.fields.startTime.as('datetime-local')}
										id="startDate"
										type="datetime-local"
									/>
								</div>
								<div class="flex flex-1 flex-col items-start gap-1">
									<Label for="endDate">End Time</Label>
									<Input
										{...banJacobTimespan.fields.endTime.as('datetime-local')}
										id="endDate"
										type="datetime-local"
									/>
								</div>
								<div class="flex flex-1 flex-col items-start gap-1">
									<Label for="reason">Reason</Label>
									<Input
										{...banJacobTimespan.fields.reason.as('text')}
										id="reason"
										placeholder="Enter reason for block"
										maxlength={64}
									/>
								</div>
								<Button type="submit" size="lg" class="md:mt-4" disabled={!!banJacobTimespan.pending}>
									<Plus size={16} />
								</Button>
							</div>
						</form>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</section>

	<section class="mb-16 flex w-full max-w-4xl flex-col justify-center justify-items-center gap-8">
		{#each data.leaderboards ?? [] as lb (lb.id)}
			<Jacobsettings {lb} {channels} {roles} />
		{/each}
	</section>
</div>

<Dialog.Root bind:open={clickOutsideModal}>
	<Dialog.ScrollContent>
		<Dialog.Header>
			<h3 class="text-xl">Server Jacob Leaderboard Settings</h3>
		</Dialog.Header>
		<form
			{...createJacobLeaderboardForm.enhance(async ({ form, submit }) => {
				await submit();
				if (createJacobLeaderboardForm.result?.success) {
					resetCreateFormFields();
					form.reset();
					clickOutsideModal = false;
				}
			})}
			class="mx-1 mt-4 flex flex-col gap-4"
		>
			<div class="flex flex-col items-start gap-1">
				<Label for="title">Leaderboard Name</Label>
				<Input
					{...createJacobLeaderboardForm.fields.title.as('text')}
					id="title"
					placeholder="Title"
					maxlength={64}
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="sendToChannelId">Channel to display leaderboard in</Label>
				<input
					type="hidden"
					{...createJacobLeaderboardForm.fields.sendToChannelId.as('text')}
					value={createJacobLeaderboardForm.fields.sendToChannelId.value() ?? ''}
				/>
				<Select.Simple
					options={channels}
					placeholder="Select a channel"
					bind:value={
						() => createJacobLeaderboardForm.fields.sendToChannelId.value() ?? '',
						(val) => createJacobLeaderboardForm.fields.sendToChannelId.set(val)
					}
				/>
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					class="hidden"
					name={createJacobLeaderboardForm.fields.enableUpdates.as('checkbox').name}
					value="true"
					aria-invalid={createJacobLeaderboardForm.fields.enableUpdates.as('checkbox')['aria-invalid']}
					bind:checked={
						() => createJacobLeaderboardForm.fields.enableUpdates.value() ?? false,
						(val) => createJacobLeaderboardForm.fields.enableUpdates.set(val)
					}
				/>
				<Checkbox
					id="enableUpdates"
					bind:checked={
						() => createJacobLeaderboardForm.fields.enableUpdates.value() ?? false,
						(val) => createJacobLeaderboardForm.fields.enableUpdates.set(val)
					}
				/>
				<Label for="enableUpdates">Send update messages</Label>
			</div>

			{#if createJacobLeaderboardForm.fields.enableUpdates.value() ?? false}
				<div class="flex flex-col items-start gap-1">
					<Label for="mentionRoleId">Role to mention when leaderboard updates</Label>
					<input
						type="hidden"
						{...createJacobLeaderboardForm.fields.mentionRoleId.as('text')}
						value={createJacobLeaderboardForm.fields.mentionRoleId.value() ?? ''}
					/>
					<Select.Simple
						options={roles}
						placeholder="Select a role"
						bind:value={
							() => createJacobLeaderboardForm.fields.mentionRoleId.value() ?? '',
							(val) => createJacobLeaderboardForm.fields.mentionRoleId.set(val)
						}
					/>
				</div>

				<div class="flex flex-col items-start gap-1">
					<Label for="updatesChannelId">Channel to send leaderboard updates in</Label>
					<input
						type="hidden"
						{...createJacobLeaderboardForm.fields.updatesChannelId.as('text')}
						value={createJacobLeaderboardForm.fields.updatesChannelId.value() ?? ''}
					/>
					<Select.Simple
						options={channels}
						placeholder="Select a channel"
						bind:value={
							() => createJacobLeaderboardForm.fields.updatesChannelId.value() ?? '',
							(val) => createJacobLeaderboardForm.fields.updatesChannelId.set(val)
						}
					/>
				</div>

				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						class="hidden"
						name={createJacobLeaderboardForm.fields.tinyUpdatesPing.as('checkbox').name}
						value="true"
						aria-invalid={createJacobLeaderboardForm.fields.tinyUpdatesPing.as('checkbox')['aria-invalid']}
						bind:checked={
							() => createJacobLeaderboardForm.fields.tinyUpdatesPing.value() ?? false,
							(val) => createJacobLeaderboardForm.fields.tinyUpdatesPing.set(val)
						}
					/>
					<Checkbox
						id="tinyUpdatesPing"
						bind:checked={
							() => createJacobLeaderboardForm.fields.tinyUpdatesPing.value() ?? false,
							(val) => createJacobLeaderboardForm.fields.tinyUpdatesPing.set(val)
						}
					/>
					<Label for="tinyUpdatesPing">Ping for updates with tiny improvements</Label>
				</div>
			{/if}
			<div class="flex flex-col items-start gap-1">
				<Label for="requiredRoleId">Role required to submit scores</Label>
				<input
					type="hidden"
					{...createJacobLeaderboardForm.fields.requiredRoleId.as('text')}
					value={createJacobLeaderboardForm.fields.requiredRoleId.value() ?? ''}
				/>
				<Select.Simple
					options={roles}
					placeholder="Select a role"
					bind:value={
						() => createJacobLeaderboardForm.fields.requiredRoleId.value() ?? '',
						(val) => createJacobLeaderboardForm.fields.requiredRoleId.set(val)
					}
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="blockedRoleId">Role blacklisted from this leaderboard</Label>
				<input
					type="hidden"
					{...createJacobLeaderboardForm.fields.blockedRoleId.as('text')}
					value={createJacobLeaderboardForm.fields.blockedRoleId.value() ?? ''}
				/>
				<Select.Simple
					options={roles}
					placeholder="Select a role"
					bind:value={
						() => createJacobLeaderboardForm.fields.blockedRoleId.value() ?? '',
						(val) => createJacobLeaderboardForm.fields.blockedRoleId.set(val)
					}
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="startDate">Allow scores only after</Label>
				<Input
					{...createJacobLeaderboardForm.fields.startDate.as('datetime-local')}
					id="startDate"
					type="datetime-local"
				/>
			</div>

			<div class="flex flex-col items-start gap-1">
				<Label for="endDate">Allow scores until</Label>
				<Input
					{...createJacobLeaderboardForm.fields.endDate.as('datetime-local')}
					id="endDate"
					type="datetime-local"
				/>
			</div>

			<Button type="submit" disabled={!!createJacobLeaderboardForm.pending}>Create</Button>
			<p class="text-muted-foreground text-base leading-relaxed">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.ScrollContent>
</Dialog.Root>
