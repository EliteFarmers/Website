<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Textarea } from '$ui/textarea';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import { pending } from '$lib/utils';
	import { enhance } from '$app/forms';
	import Settings from '@lucide/svelte/icons/settings-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type { components } from '$lib/api/api';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let category = $derived(data.category);
	let items = $state(data.category.products ?? []);
	let loading = $state(false);
	let productId = $state('');

	function handle(e: CustomEvent<DndEvent<components['schemas']['ProductDto']>>) {
		items = e.detail.items;
	}
</script>

<Head title="Product" description="Manage product" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">{category.title}</h1>

		{#if category.description}
			<p class="mb-8">{category.description}</p>
		{/if}

		<div class="flex w-full flex-col items-start gap-4 lg:flex-row">
			<form method="post" action="?/editCategory" class="flex max-w-md flex-1 flex-col gap-3" use:enhance>
				<input type="hidden" name="id" bind:value={category.id} />

				<div class="flex flex-col items-start gap-2">
					<Label>Title</Label>
					<Input name="title" value={category.title} placeholder="Category Title" maxlength={256} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Slug</Label>
					<Input name="slug" value={category.slug} placeholder="Category URL slug" maxlength={32} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Description</Label>
					<Textarea
						name="description"
						value={category.description}
						placeholder="Category Description"
						maxlength={512}
					/>
				</div>

				<div class="flex flex-row items-center gap-2">
					<Switch name="published" checked={category.published}></Switch>
					<Label>Published</Label>
				</div>

				<Button type="submit" class="w-fit pt-2">Save Changes</Button>
			</form>
			<form method="post" action="?/addProduct" class="flex max-w-md flex-1 flex-col gap-4" use:pending={loading}>
				<input type="hidden" name="category" value={category.id} />

				<div class="flex flex-col items-start gap-2">
					<Label>Products</Label>
					<ComboBox
						disabled={loading}
						options={data.products.map((b) => ({
							value: (b.id ?? 0).toString(),
							label: b.name ?? 'Unknown',
						}))}
						bind:value={productId}
						placeholder="Select Product"
						btnClass="w-full"
						popoverClass="w-full"
					/>
					<input type="hidden" name="product" value={productId} />
				</div>

				<div class="flex flex-row items-center gap-2">
					<Button type="submit" class="flex-1" disabled={loading}>Add</Button>
					<Button
						type="submit"
						class="flex-1"
						formaction="?/removeProduct"
						disabled={loading}
						variant="destructive"
					>
						Remove
					</Button>
				</div>
			</form>
		</div>
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<h2 class="my-16 text-4xl">Products</h2>

		<form action="?/updateOrder" method="post" use:enhance class="flex flex-col gap-4">
			<input type="hidden" name="category" value={category.id} />
			<div
				use:dndzone={{ items: items }}
				onconsider={handle}
				onfinalize={handle}
				class="flex w-full flex-wrap gap-4"
			>
				{#each items as product (product.id)}
					<div class="flex w-64 flex-row items-center justify-between rounded-md border-2 px-2 py-1">
						<input type="hidden" name="order.{product.id}" value={product.id} />
						<p class="overflow-hidden font-semibold text-ellipsis whitespace-nowrap">{product.name}</p>
						<div class="flex flex-row items-center gap-2">
							<Button href="/shop/{product.id}" class="m-1" variant="ghost" size="sm">
								<ExternalLink />
							</Button>
							<Button href="/admin/product/{product.id}" size="sm">
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
