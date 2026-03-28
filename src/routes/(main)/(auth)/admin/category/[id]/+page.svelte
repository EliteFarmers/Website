<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import ResponsiveImage from '$comp/responsive-image.svelte';
	import type { ProductDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { pending } from '$lib/utils';
	import { Button } from '$ui/button';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Textarea } from '$ui/textarea';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Settings from '@lucide/svelte/icons/settings-2';
	import UserMinus from '@lucide/svelte/icons/user-minus';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const gbl = getGlobalContext();
	let category = $derived(data.category);
	let items = $derived(data.category.products ?? []);
	let loading = $state(false);
	let productId = $state('');
	let artistAccountId = $state('');

	function handle(e: CustomEvent<DndEvent<ProductDto>>) {
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
					<Input
						name="slug"
						value={category.slug}
						placeholder="Category URL slug"
						maxlength={32}
						disabled={!gbl.session?.perms.admin}
					/>
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Description</Label>
					<Input
						name="description"
						value={category.description}
						placeholder="Category Description"
						maxlength={128}
					/>
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Long Description</Label>
					<Textarea
						name="long"
						value={category.longDescription}
						placeholder="Category Long Description"
						maxlength={4096}
					/>
				</div>

				<div class="flex flex-row items-center gap-2">
					<Switch name="published" checked={category.published} disabled={!gbl.session?.perms.admin}></Switch>
					<Label>Published</Label>
				</div>

				<Button type="submit" class="w-fit pt-2">Save Changes</Button>
			</form>
			<form method="post" action="?/addProduct" class="flex max-w-md flex-1 flex-col gap-4" use:pending={loading}>
				<input type="hidden" name="category" value={category.id} />

				<div class="flex flex-col items-start gap-2">
					<Label>Products</Label>
					<ComboBox
						disabled={loading || !gbl.session?.perms.admin}
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
					<Button type="submit" class="flex-1" disabled={loading || !gbl.session?.perms.admin}>Add</Button>
					<Button
						type="submit"
						class="flex-1"
						formaction="?/removeProduct"
						disabled={loading || !gbl.session?.perms.admin}
						variant="destructive"
					>
						Remove
					</Button>
				</div>
			</form>
		</div>
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<h2 class="text-xl">Banner Image</h2>

		{#if category.bannerImage}
			<div class="max-w-lg overflow-hidden rounded-md border">
				<ResponsiveImage image={category.bannerImage} alt="{category.title} banner" loading="lazy" />
			</div>
		{:else}
			<p class="text-muted-foreground">No banner image uploaded.</p>
		{/if}

		<form
			method="post"
			action="?/uploadBanner"
			enctype="multipart/form-data"
			class="flex max-w-md flex-col gap-3"
			use:pending={loading}
		>
			<input type="hidden" name="category" value={category.id} />

			<div class="flex flex-col items-start gap-2">
				<Label>Banner Image</Label>
				<Input type="file" name="image" accept=".png,.jpg,.jpeg,.webp" required />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Image Title (optional)</Label>
				<Input name="title" placeholder="Banner title" maxlength={64} />
			</div>

			<Button type="submit" class="w-fit" disabled={loading}>
				{category.bannerImage ? 'Replace Banner' : 'Upload Banner'}
			</Button>
		</form>
	</section>
	{#if gbl.session?.perms.admin}
		<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
			<h2 class="text-xl">Assigned Artist</h2>

			{#if category.assignedArtist}
				<div class="flex flex-row items-center gap-3 rounded-md border p-3">
					{#if category.assignedArtist.avatar}
						<img
							src={category.assignedArtist.avatar}
							alt="{category.assignedArtist.name}'s avatar"
							class="h-10 w-10 rounded-full"
						/>
					{/if}
					<div class="flex flex-col">
						<p class="font-semibold">{category.assignedArtist.name}</p>
						<p class="text-muted-foreground text-sm">{category.assignedArtist.id}</p>
					</div>
					<form method="post" action="?/unassignArtist" class="ml-auto" use:pending={loading}>
						<input type="hidden" name="category" value={category.id} />
						<Button
							type="submit"
							variant="destructive"
							size="sm"
							disabled={loading || !gbl.session?.perms.admin}
						>
							<UserMinus size={16} /> Unassign
						</Button>
					</form>
				</div>
			{:else}
				<p class="text-muted-foreground">No artist assigned to this category.</p>
			{/if}

			<form method="post" action="?/assignArtist" class="flex max-w-md flex-col gap-3" use:pending={loading}>
				<input type="hidden" name="category" value={category.id} />
				<div class="flex flex-col items-start gap-2">
					<Label>Discord Account ID</Label>
					<Input name="accountId" bind:value={artistAccountId} placeholder="Discord ID" required />
				</div>
				<Button type="submit" class="w-fit" disabled={loading || !artistAccountId || !gbl.session?.perms.admin}>
					<UserPlus size={16} /> Assign Artist
				</Button>
			</form>
		</section>
	{/if}
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
