<script lang="ts">
	import Head from '$comp/head.svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import * as Dialog from '$ui/dialog';
	import Settings from '@lucide/svelte/icons/settings';
	import Plus from '@lucide/svelte/icons/plus';
	import type { components } from '$lib/api/api';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let selectedBadge = $state<components['schemas']['BadgeDto'] | null>(null);
	let manageBadgeModal = $state(false);
	let createBadgeModal = $state(false);
	let grantBadgeModal = $state(false);
	let grant = $state(true);
</script>

<Head title="Badges" description="Manage badges" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Badges</h1>

		<div class="flex w-full flex-col gap-4">
			{#each data.badges as badge}
				<div class="flex w-full flex-col items-center justify-between gap-2 rounded-md bg-card p-2 md:flex-row">
					<div class="flex flex-row items-center gap-4">
						{#if badge.image?.url}
							<img src={badge.image.url} alt={badge.name} class="h-8 w-24 rounded-sm object-cover" />
						{/if}
						<div class="flex flex-col">
							<p class="text-xl font-semibold">{badge.name}</p>
							<p class="text-lg">{badge.description}</p>
							<p class="text-lg">{badge.requirements}</p>
						</div>
					</div>
					<div class="flex flex-row gap-4 pr-2">
						<div class="flex flex-col gap-2 text-right">
							<Button
								onclick={() => {
									manageBadgeModal = true;
									selectedBadge = badge;
								}}
							>
								<Settings size={16} />
							</Button>
							<Button
								onclick={() => {
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
			<Button
				class="w-fit"
				onclick={() => {
					createBadgeModal = true;
				}}
			>
				<span class="mr-2">Create New Badge</span>
				<Plus size={16} />
			</Button>
		</div>
	</section>
</div>

<Dialog.Root bind:open={manageBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>Edit Badge</Dialog.Title>
		<form
			method="post"
			action="?/editbadge"
			enctype="multipart/form-data"
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

				<div class="flex flex-col items-start gap-2">
					<Label>Name</Label>
					<Input name="name" bind:value={selectedBadge.name} placeholder="Badge Name" />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Image</Label>
					<Input name="image" type="file" />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Description</Label>
					<Input name="description" bind:value={selectedBadge.description} placeholder="Badge Description" />
				</div>

				<div class="flex flex-col items-start gap-2">
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
			enctype="multipart/form-data"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) createBadgeModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col items-start gap-2">
				<Label>Name</Label>
				<Input name="name" placeholder="Badge Name" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Image</Label>
				<Input name="image" type="file" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Description</Label>
				<Input name="description" placeholder="Badge Description" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Requirements</Label>
				<Input name="requirements" placeholder="Badge Requirements" />
			</div>

			<div class="flex flex-col items-start gap-2">
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

				<div class="flex flex-col items-start gap-2">
					<Label>Player UUID</Label>
					<Input name="uuid" placeholder="Player UUID" maxlength={36} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Mode Toggle</Label>
					<Switch bind:checked={grant} />
				</div>

				<Button type="submit">{grant ? 'Grant' : 'Remove'} Badge</Button>
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>
