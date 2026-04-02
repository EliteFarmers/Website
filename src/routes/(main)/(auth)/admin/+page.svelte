<script lang="ts">
	import { enhance } from '$app/forms';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import Head from '$comp/head.svelte';
	import { ADMIN_NAV_PAGES } from '$content/nav';
	import type { AuthFlags } from '$lib/api/auth';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Tooltip from '$ui/tooltip';
	import Plus from '@lucide/svelte/icons/plus';
	import Settings from '@lucide/svelte/icons/settings';
	import type { Component } from 'svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	const gbl = getGlobalContext();

	let { data, form }: Props = $props();

	let manageMemberModal = $state(false);
	let promoteMemberModal = $state(false);

	let selectedPermission = $state('');
	let selectedMemberId = $state('');

	let selectedMember = $derived(data.admins?.find((a) => a.id === selectedMemberId) ?? null);

	const pages = $derived(
		ADMIN_NAV_PAGES.filter((p) => p.exists(gbl.session?.perms || ({ viewAdminPages: false } as AuthFlags)))
	);
</script>

<Head title="Admin Settings" description="Admin config page." />

<div class="my-16 flex flex-col justify-start gap-2">
	<h1 class="mb-4 text-4xl">Admin Panel</h1>
	<p class="mb-12 text-sm font-semibold">
		Welcome, {gbl.session?.fIgn ?? gbl.session?.username}! Use the sidebar to navigate through the admin settings
		that you have permissions for.
	</p>

	{#if gbl.session?.perms.admin}
		<div class="mb-8">
			<Button href="/admin/audit-logs" variant="secondary">View Audit Logs</Button>
		</div>
	{/if}

	{#if form?.error}
		<p class="text-destructive text-lg">{form.error}</p>
	{/if}

	<section class="flex w-full max-w-2xl flex-col items-start gap-4">
		<h2 class="text-2xl">Admin Pages</h2>
		<div class="flex w-full max-w-2xl flex-wrap gap-2">
			{#each pages as page (page.href)}
				{#if page.href !== '/admin'}
					{@const Icon = page.icon as Component}
					<Button href={page.href} variant="outline" class="basis-30 justify-start">
						<Icon class="mr-2" />
						{page.name}
					</Button>
				{/if}
			{/each}
		</div>
	</section>

	{#if data.admins?.length}
		<section class="flex w-full max-w-2xl flex-col items-start gap-4">
			<h2 class="mt-12 text-2xl">Privileged Users</h2>
			<div class="flex w-full flex-col gap-4">
				{#each data.admins as user, i (i)}
					<div
						class="bg-muted flex w-full flex-col items-center justify-between gap-2 rounded-md md:flex-row"
					>
						<div class="flex flex-row items-center gap-4">
							<UserIcon {user} class="size-12" />
							<div class="flex flex-col">
								<p class="text-xl">{user.username}</p>
								<p>{user.id}</p>
							</div>
						</div>
						<div class="flex flex-row items-center gap-4 pr-2">
							<div class="flex flex-wrap gap-2 text-right">
								{#each user.roles ?? [] as role, i (i)}
									<p>{role}</p>
								{/each}
							</div>
							{#if gbl.session?.perms.admin}
								<Tooltip.Simple>
									{#snippet child({ props })}
										<Button
											{...props}
											class="max-h-12"
											onclick={() => {
												manageMemberModal = true;
												selectedMemberId = user.id ?? '';
											}}
										>
											<Settings size={16} />
										</Button>
									{/snippet}
									<div>Manage Permissions</div>
								</Tooltip.Simple>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			{#if gbl.session?.perms.admin}
				<Button
					onclick={() => {
						promoteMemberModal = true;
					}}
				>
					<span class="mr-2">Promote New Member</span>
					<Plus size={16} />
				</Button>
			{/if}
		</section>
	{/if}
</div>

<Dialog.Root bind:open={manageMemberModal}>
	<Dialog.Content>
		<Dialog.Title>Manage {selectedMember?.username} - {selectedMemberId}</Dialog.Title>
		<form
			method="post"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) manageMemberModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="id" bind:value={selectedMemberId} />

			<div class="space-y-2">
				<Label>Select Role</Label>
				<Select.Simple
					options={(data.roles ?? []).map((p) => ({
						value: p,
						label: `${p}${selectedMember?.roles?.includes(p) ? ' (Active)' : ''}`,
					}))}
					bind:value={selectedPermission}
					placeholder="Select a role"
					name="role"
				/>
			</div>

			<div class="flex flex-row items-center gap-2">
				<Button type="submit" formaction="?/promote">Add Role</Button>
				<Button type="submit" formaction="?/demote">Remove Role</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={promoteMemberModal}>
	<Dialog.Content>
		<Dialog.Title>Promote New Member</Dialog.Title>
		<form
			method="post"
			action="?/promote"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) promoteMemberModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col items-start gap-2">
				<Label>Discord User ID</Label>
				<Input name="id" placeholder="Discord User ID" maxlength={20} />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Role</Label>
				<Select.Simple
					options={(data.roles ?? []).map((p) => ({
						value: p,
						label: p,
					}))}
					bind:value={selectedPermission}
					placeholder="Select a role"
					name="role"
				/>
			</div>

			<Button type="submit">Add Role</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
