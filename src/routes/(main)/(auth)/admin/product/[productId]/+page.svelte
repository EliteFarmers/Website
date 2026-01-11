<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import ProductPrice from '$comp/monetization/product-price.svelte';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import { pending } from '$lib/utils';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { SelectSimple } from '$ui/select';
	import { Switch } from '$ui/switch';
	import { Textarea } from '$ui/textarea';
	import Plus from '@lucide/svelte/icons/plus';
	import Settings from '@lucide/svelte/icons/settings-2';
	import X from '@lucide/svelte/icons/x';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let product = $derived(data.product);
	let loading = $state(false);
	let deleteProductImageModal = $state(false);

	let selectedColors = $derived<string[]>(data.product?.features?.embedColors ?? []);
	let selectedFlags = $derived<string[]>(data.product?.features?.flags ?? []);
	let selectedImageId = $state('');

	let styles = $derived(
		product.weightStyles?.map((s) => ({
			value: (s.id ?? 0).toString(),
			label: s.name,
		}))
	);

	let newColor = $state('');
	let newFlag = $state('');
	let isThumbnail = $state(false);
	let cosmeticId = $state('');

	let crumbs = $derived<Crumb[]>([
		{
			name: 'Admin',
			href: '/admin',
		},
		{
			name: 'Products',
			href: '/admin/products',
		},
		{
			name: product.name ?? 'Product',
		},
	]);

	const breadcrumb = getPageCtx();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});
</script>

<Head title="Product" description="Manage product" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-8 flex flex-row items-center gap-4">
			<h1 class="text-4xl">{product.name}</h1>
			<ProductPrice {product} />
		</div>

		{#if product.description}
			<p class="mb-8">{product.description}</p>
		{/if}

		<div class="flex flex-row">
			{#if product.thumbnail}
				<img
					src={product.thumbnail.url}
					alt={product.thumbnail.title ?? 'Product thumbnail'}
					class="h-32 w-32 rounded-md object-cover"
				/>
			{/if}
			{#each product.images ?? [] as image, i (i)}
				<div class="flex flex-col items-center gap-2">
					<img src={image.url} alt={image.title} class="h-32 w-32 rounded-md object-cover" />
					<div class="flex flex-row items-center gap-2">
						{#if image.title}
							<p>{image.title}</p>
						{/if}

						<Button
							variant="destructive"
							size="sm"
							onclick={() => {
								selectedImageId = image.url ?? '';
								deleteProductImageModal = true;
							}}
						>
							<X size={16} />
						</Button>
					</div>
					{#if image.description}
						<p>{image.description}</p>
					{/if}
				</div>
			{/each}
		</div>

		{#if form?.error}
			<p class="text-destructive">{form.error}</p>
		{/if}

		<div class="flex w-full flex-col gap-4 lg:flex-row">
			<form
				method="post"
				action="?/updateProduct"
				class="bg-card flex flex-1 flex-col gap-4 rounded-md border-2 p-4"
				use:enhance
			>
				<input type="hidden" name="product" value={product.id} />

				<h2 class="text-lg font-semibold">Update Product</h2>

				<div class="flex flex-col items-start gap-2">
					<Label>Product Description</Label>
					<Textarea name="description" value={product.description} maxlength={1024} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Product Price (in cents)</Label>
					<Input name="price" value={product.price} placeholder="299" />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Rewarded Badge</Label>
					<SelectSimple
						options={data.badges.map((b) => ({
							value: (b.id ?? 0).toString(),
							label: b.name,
						}))}
						value={product.features?.badgeId?.toString()}
						placeholder="Select a badge"
						name="badge"
					/>
				</div>

				<div class="flex flex-row items-center gap-2">
					<Switch name="promotions" checked={product.features?.hideShopPromotions ?? false} />
					<Label>Hide shop promotions</Label>
				</div>
				<div class="flex flex-row items-center gap-2">
					<Switch name="override" checked={product.features?.weightStyleOverride ?? false} />
					<Label>Apply Weight Style on everyone</Label>
				</div>
				<div class="flex flex-row items-center gap-2">
					<Switch name="info" checked={product.features?.moreInfoDefault ?? false} />
					<Label>"More Info" in weight command by default</Label>
				</div>
				<div class="flex flex-row items-center gap-2">
					<Switch name="emoji" checked={product.features?.customEmoji ?? false} />
					<Label>Custom Emoji permissions</Label>
				</div>

				<div class="flex flex-col items-start gap-2">
					<p class="mt-1 font-semibold">Unlocked Embed Colors</p>
					{#each selectedColors as color, i (i)}
						<input type="hidden" name="color" value={color} />
						<div class="flex flex-row items-center gap-2">
							<Button
								variant="secondary"
								size="sm"
								onclick={() => {
									selectedColors = selectedColors.filter((c) => c !== color);
								}}
							>
								<X size={16} />
							</Button>
							<Label>{color}</Label>
						</div>
					{/each}
					<div class="flex flex-row items-center gap-2">
						<Input placeholder="Add Color" bind:value={newColor} />
						<Button
							variant="secondary"
							size="sm"
							onclick={() => {
								selectedColors = [...selectedColors, newColor];
							}}
						>
							<Plus size={16} />
						</Button>
					</div>
				</div>

				<div class="flex flex-col items-start gap-2">
					<p class="font-semibold">Unlocked Flags</p>
					{#each selectedFlags as flag, i (i)}
						<input type="hidden" name="flag" value={flag} />
						<div class="flex flex-row items-center gap-2">
							<Button
								variant="secondary"
								size="sm"
								onclick={() => {
									selectedFlags = selectedFlags.filter((f) => f !== flag);
								}}
							>
								<X size={16} />
							</Button>
							<Label>{flag}</Label>
						</div>
					{/each}
					<div class="flex flex-row items-center gap-2">
						<Input placeholder="Add Flag" bind:value={newFlag} />
						<Button
							variant="secondary"
							size="sm"
							onclick={() => {
								selectedFlags = [...selectedFlags, newFlag];
							}}
						>
							<Plus size={16} />
						</Button>
					</div>
				</div>

				<div class="flex flex-row items-center gap-2">
					<Switch name="available" checked={product.available} />
					<Label>Product Available</Label>
				</div>

				<Button type="submit" disabled={loading}>Update</Button>
			</form>
			<form
				method="post"
				action="?/addImage"
				enctype="multipart/form-data"
				class="bg-card flex h-fit flex-1 flex-col gap-4 rounded-md border-2 p-4"
				use:pending={loading}
			>
				<input type="hidden" name="product" bind:value={product.id} />

				<h2 class="text-lg font-semibold">Add Product Image</h2>

				<div class="flex flex-col items-start gap-2">
					<Label>Image</Label>
					<Input type="file" name="image" accept=".png" />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Image Title</Label>
					<Input name="title" placeholder="Title" />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Image Description</Label>
					<Input name="description" placeholder="Description" />
				</div>

				<div class="flex flex-row items-center gap-2">
					<Switch bind:checked={isThumbnail} />
					<Label>Set as thumbnail</Label>
					<input type="hidden" name="thumbnail" bind:value={isThumbnail} />
				</div>

				<Button type="submit" disabled={loading}>Add Image</Button>
			</form>
			<div class="bg-card flex h-fit flex-1 flex-col gap-4 rounded-md border-2 p-4">
				<h2 class="text-lg font-semibold">Unlocked Styles</h2>

				<form method="post" action="?/addCosmetic" class="flex flex-col gap-4" use:pending={loading}>
					<input type="hidden" name="product" bind:value={product.id} />

					<div class="flex flex-col items-start gap-2">
						<Label>Rewarded Cosmetic</Label>
						<ComboBox
							disabled={loading}
							options={data.styles.map((b) => ({
								value: (b.id ?? 0).toString(),
								label: b.name ?? 'Unknown',
							}))}
							bind:value={cosmeticId}
							placeholder="Select Style"
							btnClass="w-full"
							popoverClass="w-full"
						/>
						<input type="hidden" name="cosmetic" bind:value={cosmeticId} />
					</div>

					<div class="flex flex-row items-center gap-2">
						<Button type="submit" class="flex-1" disabled={loading}>Add</Button>
						<Button
							type="submit"
							class="flex-1"
							formaction="?/removeCosmetic"
							disabled={loading}
							variant="destructive"
						>
							Remove
						</Button>
					</div>
				</form>

				<div class="flex flex-col gap-2">
					{#each styles ?? [] as style, i (i)}
						<Card.Root>
							<Card.Content class="p-4">
								<div class="flex flex-row items-center justify-between">
									<p class="font-semibold">{style.label}</p>
									<div class="flex flex-row gap-2">
										<Button href="/admin/style/{style.value}" variant="outline" size="sm">
											<Settings />
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</div>
		</div>
	</section>
</div>

<Dialog.Root bind:open={deleteProductImageModal}>
	<Dialog.Content class="max-h-[80%] overflow-auto">
		<Dialog.Title>Delete Product Image</Dialog.Title>
		<form
			action="?/deleteImage"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result) deleteProductImageModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="product" bind:value={product.id} />
			<input type="hidden" name="image" bind:value={selectedImageId} />
			<p>Are you sure you want to delete this image?</p>
			<Button type="submit" disabled={loading} variant="destructive">Delete</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
