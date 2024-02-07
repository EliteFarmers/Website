<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Tooltip from '$ui/tooltip';
	import * as Dialog from '$ui/dialog';
	import type { ActionData, PageData } from './$types';
	import Settings from 'lucide-svelte/icons/settings';
	import Plus from 'lucide-svelte/icons/plus';
	import { enhance } from '$app/forms';
	import Usericon from '$comp/stats/discord/usericon.svelte';

	export let data: PageData;
	export let form: ActionData;

	let permissions = Object.entries(data.permissions);

	let manageMemberModal = false;
	let promoteMemberModal = false;

	$: selectedPermission = '';

	$: selectedMemberId = '';
	$: selectedMember = data.admins?.find((a) => a.id === selectedMemberId) ?? null;
</script>

<Head title="Player Charts" description="Admin page to view player stats" />

<main class="flex flex-col gap-2 justify-center items-center my-16">
	<h1 class="text-4xl mb-16">Admin Panel</h1>

	{#if form?.error}
		<p class="text-lg text-red-500">{form.error}</p>
	{/if}

	<section class="flex flex-col gap-4 w-full max-w-2xl items-center">
		<div class="flex flex-col gap-4 w-full">
			{#each data.admins as user}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
				>
					<div class="flex flex-row gap-4 items-center">
						<Usericon {user} size={16} />
						<div class="flex flex-col">
							<p class="text-xl">{user.username}</p>
							<p>{user.id}</p>
						</div>
					</div>
					<div class="flex flex-row gap-4 pr-2 items-center">
						<div class="flex flex-col text-right">
							{#each permissions.filter(([p]) => +p === +(user.permissions ?? 0)) as permission}
								<p class="text-lg">{permission[1].name}</p>
								<p>{permission[1].description}</p>
							{/each}
						</div>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									class="max-h-12"
									on:click={() => {
										manageMemberModal = true;
										selectedMemberId = user.id ?? '';
									}}
								>
									<Settings size={16} />
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>Manage Permissions</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>
			{/each}
		</div>
		<Button
			on:click={() => {
				promoteMemberModal = true;
			}}
		>
			<span class="mr-2">Promote New Member</span>
			<Plus size={16} />
		</Button>

		<form method="post" action="?/clearcontests" class="flex flex-col gap-2" use:enhance>
			<Button type="submit" color="red">Clear Upcoming Contests</Button>
		</form>
	</section>
</main>

<Dialog.Root bind:open={manageMemberModal}>
	<Dialog.Content>
		<Dialog.Title>Manage {selectedMember?.username} - {selectedMemberId}</Dialog.Title>
		<form
			method="post"
			action="?/{selectedMember?.permissions === +selectedPermission ? 'demote' : 'promote'}"
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
				<Label>Permission</Label>
				<Select.Simple
					options={permissions.map((p) => ({
						value: p[0],
						label: p[1].name,
					}))}
					bind:value={selectedPermission}
					placeholder="Select a permission"
					name="permission"
				/>
			</div>

			<Button type="submit">Toggle Permission</Button>
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
				<Label>Permission</Label>
				<Select.Simple
					options={permissions.map((p) => ({
						value: p[0],
						label: p[1].name,
					}))}
					bind:value={selectedPermission}
					placeholder="Select a permission"
					name="permission"
				/>
			</div>

			<Button type="submit">Promote</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
