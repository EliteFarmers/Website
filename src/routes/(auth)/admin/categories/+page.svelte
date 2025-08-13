<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import type { ShopCategoryDto } from '$lib/api';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
	import Settings from '@lucide/svelte/icons/settings';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let items = $derived(data.categories);

	let createCategoryModal = $state(false);

	function handle(e: CustomEvent<DndEvent<ShopCategoryDto>>) {
		items = e.detail.items;
	}
</script>

<Head title="Products" description="Manage products" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Shop Categories</h1>

		<div class="flex flex-row items-center gap-2">
			<Button
				onclick={() => {
					createCategoryModal = true;
				}}
				class="flex w-fit flex-row gap-2"
			>
				New Category
			</Button>
		</div>
		<form action="?/updateOrder" method="post" use:enhance class="flex flex-col gap-4">
			<div
				use:dragHandleZone={{ items }}
				onconsider={handle}
				onfinalize={handle}
				class="flex w-full flex-col gap-2 rounded-lg border-2 p-2"
			>
				{#each items as category (category.id)}
					<div class="flex flex-row items-center justify-between gap-2 rounded-md border-2 p-2">
						<input type="hidden" name="order.{category.id}" value={category.id} />
						<div class="flex flex-row items-center gap-2">
							<div use:dragHandle class="cursor-move rounded-md p-2">
								<GripHorizontal size={16} />
							</div>
							<p>{category.title}</p>
						</div>

						<div class="flex flex-row items-center gap-2">
							<Button href="/shop/{category.slug}" class="m-1" variant="ghost" size="sm">
								<ExternalLink />
							</Button>
							<Button href="/admin/category/{category.slug}" size="sm">
								<Settings size={16} />
							</Button>
						</div>
					</div>
				{/each}
			</div>

			<Button class="w-fit" type="submit">Update Order</Button>
		</form>
	</section>
</div>

<Dialog.Root bind:open={createCategoryModal}>
	<Dialog.Content class="max-h-[80%] overflow-y-auto">
		<Dialog.Title>New Shop Category</Dialog.Title>
		<form
			method="post"
			action="?/createCategory"
			class="flex w-full flex-col gap-2"
			use:enhance={() => {
				return async ({ update }) => {
					createCategoryModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col items-start gap-2">
				<Label>Title</Label>
				<Input name="title" placeholder="Category Title" required maxlength={256} />
			</div>
			<div class="flex flex-col items-start gap-2">
				<Label>Slug</Label>
				<Input name="slug" placeholder="Category URL slug" required maxlength={32} />
			</div>
			<div class="flex flex-col items-start gap-2">
				<Label>Description</Label>
				<Textarea name="description" placeholder="Category Description" maxlength={512} />
			</div>

			<Button type="submit" class="w-fit">Create Category</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
