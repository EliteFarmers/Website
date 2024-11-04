<script lang="ts">
	import Head from '$comp/head.svelte';
	import ProductPrice from '$comp/monetization/product-price.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { SelectSimple } from '$ui/select';
	import { Textarea } from '$ui/textarea';
	import * as Dialog from '$ui/dialog';
	import * as Card from '$ui/card';
	import { pending } from '$lib/utils';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import { enhance } from '$app/forms';

	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

	$: product = data.product;
	let loading = false;
	let deleteProductImageModal = false;

	$: selectedStyles = product?.features?.weightStyles ?? [];
	$: selectedColors = product?.features?.embedColors ?? [];
	$: selectedImageId = '';

	$: changedSettings = {
		shopPromotions: false,
		styleOverride: false,
		moreInfo: false,
		badgeId: '',
		available: false,
	};

	$: styles = product.weightStyles?.map((s) => ({
		value: (s.id ?? 0).toString(),
		label: s.name,
	}));

	onMount(() => {
		changedSettings.shopPromotions = product?.features?.hideShopPromotions ?? false;
		changedSettings.styleOverride = product?.features?.weightStyleOverride ?? false;
		changedSettings.moreInfo = product?.features?.moreInfoDefault ?? false;
		changedSettings.badgeId = product?.features?.badgeId?.toString() ?? '';
		changedSettings.available = product.available ?? false;
	});

	let newStyle = '';
	let newColor = '';
	let isThumbnail = false;
</script>

<Head title="Product" description="Manage product" />

<main class="my-16">
	<section class="flex flex-col gap-4 w-full max-w-4xl my-8">
		<div class="flex flex-row items-center gap-4 mb-8">
			<h1 class="text-4xl">{product.name}</h1>
			<ProductPrice {product} />
		</div>

		{#if product.description}
			<p class="font-semibold">Description</p>
		{/if}

		<div class="flex flex-row">
			{#if product.thumbnail}
				<img
					src={product.thumbnail.url}
					alt={product.thumbnail.title ?? 'Product thumbnail'}
					class="w-32 h-32 object-cover rounded-md"
				/>
			{/if}
			{#each product.images ?? [] as image}
				<div class="flex flex-col gap-2 items-center">
					<img src={image.url} alt={image.title} class="w-32 h-32 object-cover rounded-md" />
					<div class="flex flex-row items-center gap-2">
						{#if image.title}
							<p>{image.title}</p>
						{/if}

						<Button
							variant="destructive"
							size="sm"
							on:click={() => {
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
			<p class="text-red-500">{form.error}</p>
		{/if}

		<div class="flex flex-col lg:flex-row gap-4 w-full">
			<form method="post" action="?/updateProduct" class="flex flex-col gap-4 flex-1" use:enhance>
				<input type="hidden" name="product" bind:value={product.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Product Description</Label>
					<Textarea name="description" bind:value={product.description} maxlength={1024} />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Product Price</Label>
					<Input name="price" bind:value={product.price} placeholder="299" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Rewarded Badge</Label>
					<SelectSimple
						options={data.badges.map((b) => ({
							value: (b.id ?? 0).toString(),
							label: b.name,
						}))}
						bind:value={changedSettings.badgeId}
						placeholder="Select a badge"
						name="badge"
					/>
				</div>

				<div class="flex flex-row gap-2 items-center">
					<Switch bind:checked={changedSettings.shopPromotions} />
					<Label>Hide shop promotions</Label>
					<input type="hidden" name="promotions" bind:value={changedSettings.shopPromotions} />
				</div>
				<div class="flex flex-row gap-2 items-center">
					<Switch bind:checked={changedSettings.styleOverride} />
					<Label>Apply Weight Style on everyone</Label>
					<input type="hidden" name="override" bind:value={changedSettings.styleOverride} />
				</div>
				<div class="flex flex-row gap-2 items-center">
					<Switch bind:checked={changedSettings.moreInfo} />
					<Label>"More Info" in weight command by default</Label>
					<input type="hidden" name="info" bind:value={changedSettings.moreInfo} />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<p class="mt-1 font-semibold">Unlocked Embed Colors</p>
					{#each selectedColors as color}
						<input type="hidden" name="color" value={color} />
						<div class="flex flex-row gap-2 items-center">
							<Button
								variant="secondary"
								size="sm"
								on:click={() => {
									selectedColors = selectedColors.filter((c) => c !== color);
								}}
							>
								<X size={16} />
							</Button>
							<Label>{color}</Label>
						</div>
					{/each}
					<div class="flex flex-row gap-2 items-center">
						<Input placeholder="Add Color" bind:value={newColor} />
						<Button
							variant="secondary"
							size="sm"
							on:click={() => {
								selectedColors = [...selectedColors, newColor];
							}}
						>
							<Plus size={16} />
						</Button>
					</div>
				</div>

				<div class="flex flex-row gap-2 items-center">
					<Switch bind:checked={changedSettings.available} />
					<Label>Product Available</Label>
					<input type="hidden" name="available" bind:value={changedSettings.available} />
				</div>

				<Button type="submit" disabled={loading}>Update</Button>
			</form>
			<form
				method="post"
				action="?/addImage"
				enctype="multipart/form-data"
				class="flex flex-col gap-4 flex-1"
				use:pending={loading}
			>
				<input type="hidden" name="product" bind:value={product.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Image</Label>
					<Input type="file" name="image" accept=".png" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Image Title</Label>
					<Input name="title" placeholder="Title" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Image Description</Label>
					<Input name="description" placeholder="Description" />
				</div>

				<div class="flex flex-row gap-2 items-center">
					<Switch bind:checked={isThumbnail} />
					<Label>Set as thumbnail</Label>
					<input type="hidden" name="thumbnail" bind:value={isThumbnail} />
				</div>

				<Button type="submit" disabled={loading}>Add Image</Button>
			</form>
			<div class="flex flex-col flex-1 gap-4">
				<h2 class="text-xl font-semibold">Unlocked Styles</h2>

				<div class="flex flex-col gap-2">
					{#each styles ?? [] as style}
						<Card.Root>
							<Card.Content class="p-4">
								<p>{style.label}</p>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>

				<form method="post" action="?/addCosmetic" class="flex flex-col gap-4" use:pending={loading}>
					<input type="hidden" name="product" bind:value={product.id} />

					<div class="flex flex-col gap-2 items-start">
						<Label>Rewarded Cosmetic</Label>
						<SelectSimple
							options={data.styles.map((b) => ({
								value: (b.id ?? 0).toString(),
								label: b.name ?? 'Unknown',
							}))}
							placeholder="Select a style"
							name="cosmetic"
						/>
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
			</div>
		</div>
	</section>
</main>

<Dialog.Root bind:open={deleteProductImageModal}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
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
