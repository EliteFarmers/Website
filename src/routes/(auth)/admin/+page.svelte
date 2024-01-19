<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button, Input, Label, Modal, Popover, Select } from 'flowbite-svelte';
	import type { ActionData, PageData } from './$types';
	import { GearSolid, PlusSolid } from 'flowbite-svelte-icons';
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
						<Button
							class="add max-h-12"
							color="green"
							size="sm"
							on:click={() => {
								manageMemberModal = true;
								selectedMemberId = user.id ?? '';
							}}
						>
							<GearSolid size="sm" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
		<Button
			class="max-h-12 max-w-16"
			color="green"
			size="sm"
			on:click={() => {
				promoteMemberModal = true;
			}}
		>
			<span class="mr-2">Promote New Member</span>
			<PlusSolid size="sm" />
		</Button>

		<form method="post" action="?/clearcontests" class="flex flex-col gap-2" use:enhance>
			<Button type="submit" color="red">Clear Upcoming Contests</Button>
		</form>
	</section>
</main>

<Popover triggeredBy=".add" placement="left">
	<p>Manage Permissions</p>
</Popover>

<Modal title="Manage Member Permissions" bind:open={manageMemberModal} autoclose={false}>
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
		<h3 class="text-lg mb-2 text-black dark:text-white">{selectedMember?.username} - {selectedMemberId}</h3>
		<input type="hidden" name="id" bind:value={selectedMemberId} />

		<Label class="space-y-2">
			<span>Permission</span>
			<Select
				items={permissions.map((p) => ({
					value: p[0],
					name: p[1].name,
				}))}
				bind:value={selectedPermission}
				placeholder="Select a permission"
				name="permission"
			/>
		</Label>

		<Button type="submit">Toggle Permission</Button>
	</form>
</Modal>

<Modal title="Promote New Member" bind:open={promoteMemberModal} autoclose={false}>
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
		<h3 class="text-lg mb-2 text-black dark:text-white">Promote New Member</h3>

		<Label class="space-y-2">
			<span>Discord User ID</span>
			<Input let:props name="id" placeholder="Discord User ID">
				<input {...props} type="text" maxlength="20" />
			</Input>
		</Label>

		<Label class="space-y-2">
			<span>Permission</span>
			<Select
				items={permissions.map((p) => ({
					value: p[0],
					name: p[1].name,
				}))}
				bind:value={selectedPermission}
				placeholder="Select a permission"
				name="permission"
			/>
		</Label>

		<Button type="submit">Promote</Button>
	</form>
</Modal>
