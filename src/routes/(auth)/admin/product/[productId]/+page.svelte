<script lang="ts">
	import Head from '$comp/head.svelte';
	import ProductPrice from '$comp/monetization/product-price.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { SelectSimple } from '$ui/select';
	import { Textarea } from '$ui/textarea';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import * as Dialog from '$ui/dialog';
	import * as Card from '$ui/card';
	import { pending } from '$lib/utils';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import { enhance } from '$app/forms';
	import Settings from 'lucide-svelte/icons/settings-2';
	import { onMount } from 'svelte';

	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let product = $derived(data.product);
	let loading = $state(false);
	let deleteProductImageModal = $state(false);

	let selectedColors = $state<string[]>(data.product?.features?.embedColors ?? []);
	let selectedImageId = $state('');

	let changedSettings = $derived({
		shopPromotions: false,
		styleOverride: false,
		moreInfo: false,
		badgeId: '',
		available: false,
	});

	let styles = $derived(
		product.weightStyles?.map((s) => ({
			value: (s.id ?? 0).toString(),
			label: s.name,
		}))
	);

	onMount(() => {
		changedSettings.shopPromotions = product?.features?.hideShopPromotions ?? false;
		changedSettings.styleOverride = product?.features?.weightStyleOverride ?? false;
		changedSettings.moreInfo = product?.features?.moreInfoDefault ?? false;
		changedSettings.badgeId = product?.features?.badgeId?.toString() ?? '';
		changedSettings.available = product.available ?? false;
	});

	let newColor = $state('');
	let isThumbnail = $state(false);
	let cosmeticId = $state('');
</script>

<Head title="Product" description="Manage product" />

<main class="my-16">
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
			{#each product.images ?? [] as image}
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
			<p class="text-red-500">{form.error}</p>
		{/if}

		<div class="flex w-full flex-col gap-4 lg:flex-row">
			<form method="post" action="?/updateProduct" class="flex flex-1 flex-col gap-4" use:enhance>
				<input type="hidden" name="product" bind:value={product.id} />

				<div class="flex flex-col items-start gap-2">
					<Label>Product Description</Label>
					<Textarea name="description" bind:value={product.description} maxlength={1024} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<Label>Product Price</Label>
					<Input name="price" bind:value={product.price} placeholder="299" />
				</div>

				<div class="flex flex-col items-start gap-2">
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

				<div class="flex flex-row items-center gap-2">
					<Switch bind:checked={changedSettings.shopPromotions} />
					<Label>Hide shop promotions</Label>
					<input type="hidden" name="promotions" bind:value={changedSettings.shopPromotions} />
				</div>
				<div class="flex flex-row items-center gap-2">
					<Switch bind:checked={changedSettings.styleOverride} />
					<Label>Apply Weight Style on everyone</Label>
					<input type="hidden" name="override" bind:value={changedSettings.styleOverride} />
				</div>
				<div class="flex flex-row items-center gap-2">
					<Switch bind:checked={changedSettings.moreInfo} />
					<Label>"More Info" in weight command by default</Label>
					<input type="hidden" name="info" bind:value={changedSettings.moreInfo} />
				</div>

				<div class="flex flex-col items-start gap-2">
					<p class="mt-1 font-semibold">Unlocked Embed Colors</p>
					{#each selectedColors as color}
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

				<div class="flex flex-row items-center gap-2">
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
				class="flex flex-1 flex-col gap-4"
				use:pending={loading}
			>
				<input type="hidden" name="product" bind:value={product.id} />

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
			<div class="flex flex-1 flex-col gap-4">
				<h2 class="text-xl font-semibold">Unlocked Styles</h2>

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
					{#each styles ?? [] as style}
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
</main>

<Dialog.Root bind:open={deleteProductImageModal}>
	<Dialog.Content class="max-h-[80%] overflow-scroll">
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
