<script lang="ts">
	import { enhance } from '$app/forms';
	import type { AnnouncementType } from '$lib/api';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { SelectSimple } from '$ui/select';
	import { Textarea } from '$ui/textarea';
	import Plus from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let createModal = $state(false);

	const types: Record<AnnouncementType, string> = {
		news: 'News',
		update: 'Update',
		maintenance: 'Maintenance',
		other: 'Other',
		article: 'Article',
		event: 'Event',
		shop: 'Shop',
	};

	const options = Object.entries(types).map(([value, label]) => ({ value, label }));
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
				<p class="text-muted-foreground">{announcement.content}</p>
				<p class="text-muted-foreground text-sm">
					Posted on: {new Date(announcement.createdAt).toLocaleDateString()}
				</p>
				<p class="text-muted-foreground text-sm">
					Expires on: {new Date(announcement.expiresAt).toLocaleDateString()}
				</p>
				<p class="text-muted-foreground text-sm">
					Links to <a href={announcement.targetUrl} class="text-link underline">{announcement.targetLabel}</a>
				</p>
			</div>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={createModal}>
	<Dialog.ScrollContent>
		<Dialog.Title class="mb-4">Create Announcement</Dialog.Title>
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
				<Label>Title</Label>
				<Input name="title" placeholder="Announcement Title" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Content</Label>
				<Textarea name="content" placeholder="Announcement Content" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Type</Label>
				<SelectSimple name="type" {options} placeholder="Select Announcement Type" required />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Expiration Date</Label>
				<Input type="datetime-local" name="expiresAt" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Target Label</Label>
				<Input name="label" placeholder="Read More" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Target URL</Label>
				<Input name="targetUrl" placeholder="https://example.com" />
			</div>

			<Button type="submit">Create Announcement</Button>
		</form>
	</Dialog.ScrollContent>
</Dialog.Root>
