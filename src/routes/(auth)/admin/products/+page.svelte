<script lang="ts">
	import Head from '$comp/head.svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import * as Dialog from '$ui/dialog';
	import SelectSimple from '$ui/select/select-simple.svelte';
	import Settings from 'lucide-svelte/icons/settings';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import Product from '$comp/monetization/product.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let editProductModal = false;

	$: selectedProductId = '';
	$: selectedProduct = data.products?.find((a) => a.id === selectedProductId) ?? null;
	$: selectedStyles = selectedProduct?.features?.weightStyles ?? [];
	$: selectedColors = selectedProduct?.features?.embedColors ?? [];

	$: changedSettings = {
		shopPromotions: selectedProduct?.features?.hideShopPromotions ?? false,
		styleOverride: selectedProduct?.features?.weightStyleOverride ?? false,
		moreInfo: selectedProduct?.features?.moreInfoDefault ?? false,
		badgeId: selectedProduct?.features?.badgeId ?? '',
	};

	let newStyle = '';
	let newColor = '';
</script>

<Head title="Products" description="Manage products" />

<main>
	<section class="flex flex-col gap-4 w-full max-w-2xl my-8">
		<h2 class="text-2xl">Products</h2>
		<div class="flex flex-col gap-4 w-full">
			{#each data.products as product}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
				>
					<Product {product} />
					<div class="flex flex-row gap-4 pr-2">
						<Button
							on:click={() => {
								editProductModal = true;
								selectedProductId = product.id;
							}}
						>
							<Settings size={16} />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>

<Dialog.Root bind:open={editProductModal}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>Edit Product</Dialog.Title>
		<form
			method="post"
			action="?/updateProduct"
			class="flex flex-col gap-4"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) editProductModal = false;
					update();
				};
			}}
		>
			{#if selectedProduct}
				<input type="hidden" name="product" bind:value={selectedProduct.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Product Icon URL</Label>
					<Input name="icon" bind:value={selectedProduct.icon} placeholder="URL" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Product Description</Label>
					<Input name="description" bind:value={selectedProduct.description} placeholder="Description" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Rewarded Badge</Label>
					<SelectSimple
						options={data.badges.map((b) => ({
							value: b.id ?? 0,
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
					<p class="mt-1 font-semibold">Unlocked Weight Styles</p>
					{#each selectedStyles as style}
						<input type="hidden" name="style" value={style} />
						<div class="flex flex-row gap-2 items-center">
							<Button
								variant="secondary"
								size="sm"
								on:click={() => {
									selectedStyles = selectedStyles.filter((s) => s !== style);
								}}
							>
								<X size={16} />
							</Button>
							<Label>{style}</Label>
						</div>
					{/each}
					<div class="flex flex-row gap-2 items-center">
						<Input placeholder="Add Style" bind:value={newStyle} />
						<Button
							variant="secondary"
							size="sm"
							on:click={() => {
								selectedStyles = [...selectedStyles, newStyle];
							}}
						>
							<Plus size={16} />
						</Button>
					</div>
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

				<Button type="submit">Update</Button>
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>
