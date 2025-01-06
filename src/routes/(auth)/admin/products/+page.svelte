<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import * as Command from '$ui/command';
	import * as Dialog from '$ui/dialog';
	import Settings from 'lucide-svelte/icons/settings';
	import Product from '$comp/monetization/product.svelte';
	import type { PageData } from './$types';
	import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { applyAction, enhance } from '$app/forms';
	import { ScrollArea } from '$ui/scroll-area';
	import type { components } from '$lib/api/api';
	import { Label } from '$ui/label';
	import { Input } from '$ui/input';
	import { Textarea } from '$ui/textarea';
	import { Switch } from '$comp/ui/switch';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let createCategoryModal = $state(false);
	let editCategoryModal = $state(false);

	let selectedCategory = $state<components['schemas']['ShopCategoryDto'] | null>(null);
</script>

<Head title="Products" description="Manage products" />

<main class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Product Management</h1>

		<div class="flex flex-row items-center gap-2">
			<Button
				target="_blank"
				href="https://discord.com/developers/applications/{PUBLIC_DISCORD_CLIENT_ID}/skus"
				class="flex w-fit flex-row gap-2"
			>
				New Product
				<ExternalLink size={16} />
			</Button>
			<form action="?/refresh" method="post" use:enhance>
				<Button class="w-fit" type="submit" variant="secondary">Refresh Products</Button>
			</form>
		</div>

		<div class="flex w-full flex-col gap-2">
			<Command.Root>
				<Command.Input placeholder="Filter products..." class="h-9" />
				<Command.Empty>No products found.</Command.Empty>
				<ScrollArea orientation="vertical" class="h-96 overflow-auto">
					<Command.Group itemsClass="flex flex-wrap gap-3">
						{#each data.products as product (product.id)}
							<Command.Item value={product.name ?? ''} class="rounded-md p-0 hover:rounded-md">
								<Product
									{product}
									showPublished={true}
									showFeatures={false}
									class="m-0 md:min-w-[30rem]"
								>
									<Button href="/shop/{product.id}" class="m-1" variant="ghost" size="sm">
										<ExternalLink />
									</Button>
									<Button href="/admin/product/{product.id}" size="sm">
										<Settings size={16} />
									</Button>
								</Product>
							</Command.Item>
						{/each}
					</Command.Group>
				</ScrollArea>
			</Command.Root>
		</div>
	</section>
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h2 class="mb-8 mt-16 text-3xl">Shop Categories</h2>

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

		<div class="flex w-full flex-col gap-2">
			<Command.Root>
				<Command.Input placeholder="Filter categories..." class="h-9" />
				<Command.Empty>No categories found.</Command.Empty>
				<ScrollArea orientation="vertical" class="h-96 overflow-auto">
					<Command.Group itemsClass="flex flex-col gap-3">
						{#each data.categories as category}
							<Command.Item value={category.title ?? ''} class="w-fit rounded-md p-0 hover:rounded-md">
								<div class="flex flex-row items-center justify-between gap-2 rounded-md border-2 p-2">
									<p>{category.title}</p>

									<Button href="/shop/{category.slug}" class="m-1" variant="ghost" size="sm">
										<ExternalLink />
									</Button>
									<Button
										onclick={() => {
											selectedCategory = category;
											editCategoryModal = true;
										}}
										size="sm"
									>
										<Settings size={16} />
									</Button>
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				</ScrollArea>
			</Command.Root>
		</div>
	</section>
</main>

<Dialog.Root bind:open={createCategoryModal}>
	<Dialog.Content class="max-h-[80%] overflow-y-auto">
		<Dialog.Title>New Shop Category</Dialog.Title>
		<form
			method="post"
			action="?/createCategory"
			class="flex w-full flex-col gap-2"
			use:enhance={() => {
				return async ({ result }) => {
					createCategoryModal = false;
					applyAction(result);
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

<Dialog.Root bind:open={editCategoryModal}>
	<Dialog.Content class="max-h-[80%] overflow-y-auto">
		{#if selectedCategory}
			<Dialog.Title>Edit {selectedCategory.title}</Dialog.Title>

			<form
				method="post"
				action="?/editCategory"
				class="flex w-full flex-col gap-2"
				use:enhance={() => {
					return async ({ result }) => {
						editCategoryModal = false;
						applyAction(result);
					};
				}}
			>
				<input type="hidden" name="id" bind:value={selectedCategory.id} />

				<div class="flex flex-col items-start gap-2">
					<Label>Title</Label>
					<Input name="title" value={selectedCategory.title} placeholder="Category Title" maxlength={256} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Slug</Label>
					<Input name="slug" value={selectedCategory.slug} placeholder="Category URL slug" maxlength={32} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Description</Label>
					<Textarea
						name="description"
						value={selectedCategory.description}
						placeholder="Category Description"
						maxlength={512}
					/>
				</div>

				<div class="flex flex-row items-center gap-2">
					<Switch name="published" checked={selectedCategory.published}></Switch>
					<Label>Published</Label>
				</div>

				<Button type="submit" class="w-fit pt-2">Save Changes</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
