<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Popover from '$ui/popover';
	import * as Dialog from '$ui/dialog';
	import type { ActionData, PageData } from './$types';
	import { Settings, Plus } from 'lucide-svelte/icons';
	import { enhance } from '$app/forms';
	import Usericon from '$comp/stats/discord/usericon.svelte';
	import { PUBLIC_BADGE_IMAGE_URL } from '$env/static/public';
	import type { components } from '$lib/api/api';
	import { Switch } from '$comp/ui/switch';

	export let data: PageData;
	export let form: ActionData;

	let permissions = Object.entries(data.permissions);

	let manageMemberModal = false;
	let promoteMemberModal = false;
	let manageBadgeModal = false;
	let createBadgeModal = false;
	let grantBadgeModal = false;
	let grant = true;

	$: selectedPermission = '';
	$: selectedBadge = null as components['schemas']['BadgeDto'] | null;

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
						<Popover.Mobile>
							<div slot="trigger">
								<Button
									class="max-h-12"
									on:click={() => {
										manageMemberModal = true;
										selectedMemberId = user.id ?? '';
									}}
								>
									<Settings size={16} />
								</Button>
							</div>
							<div>Manage Permissions</div>
						</Popover.Mobile>
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
	</section>

	<section class="flex flex-col gap-4 w-full max-w-2xl items-center my-8">
		<h2 class="text-2xl">Badges</h2>
		<div class="flex flex-col gap-4 w-full">
			{#each data.badges as badge}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
				>
					<div class="flex flex-row gap-4 items-center">
						<img
							src="{PUBLIC_BADGE_IMAGE_URL}{badge.imageId}.png"
							alt={badge.name}
							class="w-24 h-8 rounded-sm object-cover"
						/>
						<div class="flex flex-col">
							<p class="text-xl font-semibold">{badge.name}</p>
							<p class="text-lg">{badge.description}</p>
							<p class="text-lg">{badge.requirements}</p>
						</div>
					</div>
					<div class="flex flex-row gap-4 pr-2">
						<div class="flex flex-col text-right gap-2">
							<Button
								on:click={() => {
									manageBadgeModal = true;
									selectedBadge = badge;
								}}
							>
								<Settings size={16} />
							</Button>
							<Button
								on:click={() => {
									grantBadgeModal = true;
									selectedBadge = badge;
								}}
							>
								<Plus size={16} />
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<Button
			on:click={() => {
				createBadgeModal = true;
			}}
		>
			<span class="mr-2">Create New Badge</span>
			<Plus size={16} />
		</Button>
	</section>

	<form method="post" action="?/clearcontests" class="flex flex-col gap-2 my-16" use:enhance>
		<Button type="submit" color="red">Clear Upcoming Contests</Button>
	</form>
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

<Dialog.Root bind:open={manageBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>Edit Badge</Dialog.Title>
		<form
			method="post"
			action="?/editbadge"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) manageBadgeModal = false;
					update();
				};
			}}
		>
			{#if selectedBadge}
				<input type="hidden" name="badgeId" bind:value={selectedBadge.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Name</Label>
					<Input name="name" bind:value={selectedBadge.name} placeholder="Badge Name" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Image ID</Label>
					<Input name="imageId" bind:value={selectedBadge.imageId} placeholder="Badge Image ID" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Description</Label>
					<Input name="description" bind:value={selectedBadge.description} placeholder="Badge Description" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Requirements</Label>
					<Input
						name="requirements"
						bind:value={selectedBadge.requirements}
						placeholder="Badge Requirements"
					/>
				</div>

				<Button type="submit">Edit</Button>
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={createBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>Create Badge</Dialog.Title>
		<form
			method="post"
			action="?/createbadge"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) createBadgeModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col gap-2 items-start">
				<Label>Name</Label>
				<Input name="name" placeholder="Badge Name" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Image ID</Label>
				<Input name="imageId" placeholder="Badge Image ID" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Description</Label>
				<Input name="description" placeholder="Badge Description" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Requirements</Label>
				<Input name="requirements" placeholder="Badge Requirements" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Tie To Account</Label>
				<Switch name="tied" />
			</div>

			<Button type="submit">Create</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={grantBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>{grant ? 'Grant' : 'Remove'} User Badge</Dialog.Title>
		<form
			method="post"
			action={grant ? '?/adduserbadge' : '?/deleteuserbadge'}
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) grantBadgeModal = false;
					update();
				};
			}}
		>
			{#if selectedBadge}
				<input type="hidden" name="badgeId" bind:value={selectedBadge.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Player UUID</Label>
					<Input name="uuid" placeholder="Player UUID" maxlength={36} />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Mode Toggle</Label>
					<Switch bind:checked={grant} />
				</div>

				<Button type="submit">{grant ? 'Grant' : 'Remove'} Badge</Button>
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>
