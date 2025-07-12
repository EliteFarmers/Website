<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import Plus from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let createModal = $state(false);
</script>

<div class="my-16 flex flex-col items-center justify-center gap-4">
	<h1 class="mb-8 text-4xl">Announcements</h1>
	<p class="mb-4 text-lg">Manage announcements for the website.</p>

	<Button onclick={() => (createModal = true)} class="mb-4">
		<Plus size={16} />
		Create Announcement
	</Button>

	<div class="flex w-full max-w-2xl flex-col items-start gap-4">
		{#each data.announcements as announcement (announcement.id)}
			<div class="bg-card w-full rounded-md p-4">
				<h2 class="text-xl font-semibold">{announcement.title}</h2>
				<p class="text-gray-700">{announcement.content}</p>
				<p class="text-sm text-gray-500">Posted on: {new Date(announcement.createdAt).toLocaleDateString()}</p>
			</div>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={createModal}>
	<Dialog.ScrollContent>
		<Dialog.Title class="mb-4">Create Badge</Dialog.Title>
		<form
			method="post"
			action="?/create"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) createModal = false;
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
	</Dialog.ScrollContent>
</Dialog.Root>
