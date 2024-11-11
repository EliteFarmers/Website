<script lang="ts">
	import Head from '$comp/head.svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Popover from '$ui/popover';
	import * as Dialog from '$ui/dialog';
	import Settings from 'lucide-svelte/icons/settings';
	import Plus from 'lucide-svelte/icons/plus';
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

<main class="flex flex-col gap-2 justify-start my-16">
	<h1 class="text-4xl mb-16">Admin Panel</h1>

	{#if form?.error}
		<p class="text-lg text-red-500">{form.error}</p>
	{/if}

	<section class="flex flex-col gap-4 w-full max-w-2xl items-start">
		<div class="flex flex-col gap-4 w-full">
			{#each data.admins as user}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
				>
					<div class="flex flex-row gap-4 items-center">
						<UserIcon {user} class="size-12" />
						<div class="flex flex-col">
							<p class="text-xl">{user.username}</p>
							<p>{user.id}</p>
						</div>
					</div>
					<div class="flex flex-row gap-4 pr-2 items-center">
						<div class="flex flex-wrap gap-2 text-right">
							{#each user.roles ?? [] as role}
								<p>{role}</p>
							{/each}
						</div>
						<Popover.Mobile>
							{#snippet trigger()}
								<Button
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
						</Popover.Mobile>
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
</main>

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

			<div class="flex flex-row gap-2 items-center">
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
			<div class="flex flex-col gap-2 items-start">
				<Label>Discord User ID</Label>
				<Input name="id" placeholder="Discord User ID" maxlength={20} />
			</div>

			<div class="flex flex-col gap-2 items-start">
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
