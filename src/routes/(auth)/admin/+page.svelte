<script lang="ts">
	import Head from '$comp/head.svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Tooltip from '$ui/tooltip';
	import * as Dialog from '$ui/dialog';
	import Settings from '@lucide/svelte/icons/settings';
	import Plus from '@lucide/svelte/icons/plus';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let manageMemberModal = $state(false);
	let promoteMemberModal = $state(false);

	let selectedPermission = $state('');
	let selectedMemberId = $state('');

	let selectedMember = $derived(data.admins?.find((a) => a.id === selectedMemberId) ?? null);
</script>

<Head title="Admin Settings" description="Admin config page." />

<div class="my-16 flex flex-col justify-start gap-2">
	<h1 class="mb-16 text-4xl">Admin Panel</h1>

	{#if form?.error}
		<p class="text-destructive text-lg">{form.error}</p>
	{/if}

	<section class="flex w-full max-w-2xl flex-col items-start gap-4">
		<div class="flex w-full flex-col gap-4">
			{#each data.admins as user, i (i)}
				<div class="bg-muted flex w-full flex-col items-center justify-between gap-2 rounded-md md:flex-row">
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
					</div>
				</div>
			{/each}
		</div>
		<Button
			onclick={() => {
				promoteMemberModal = true;
			}}
		>
			<span class="mr-2">Promote New Member</span>
			<Plus size={16} />
		</Button>
	</section>
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
					options={data.roles.map((p) => ({
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
					options={data.roles.map((p) => ({
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
