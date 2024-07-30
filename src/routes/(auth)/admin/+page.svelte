<script lang="ts">
	import Head from '$comp/head.svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import * as Select from '$ui/select';
	import * as Popover from '$ui/popover';
	import * as Dialog from '$ui/dialog';
	import SelectSimple from '$ui/select/select-simple.svelte';
	import Settings from 'lucide-svelte/icons/settings';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import UserIcon from '$comp/stats/discord/user-icon.svelte';
	import Product from '$comp/monetization/product.svelte';
	import { PUBLIC_BADGE_IMAGE_URL } from '$env/static/public';
	import type { components } from '$lib/api/api';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let manageMemberModal = false;
	let promoteMemberModal = false;
	let editProductModal = false;
	let manageBadgeModal = false;
	let createBadgeModal = false;
	let grantBadgeModal = false;
	let grant = true;

	$: selectedPermission = '';
	$: selectedBadge = null as components['schemas']['BadgeDto'] | null;

	$: selectedMemberId = '';
	$: selectedMember = data.admins?.find((a) => a.id === selectedMemberId) ?? null;

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

<Head title="Admin Settings" description="Admin config page." />

<main class="flex flex-col gap-2 justify-center items-center my-16">
	<h1 class="text-4xl mb-16">Admin Panel</h1>

	{#if form?.error}
		<p class="text-lg text-red-500">{form.error}</p>
	{/if}

	<section class="flex flex-col gap-4 w-full max-w-2xl items-center">
		<div class="flex flex-col gap-4 w-full">
			{#each data.admins as user}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
				>
					<div class="flex flex-row gap-4 items-center">
						<UserIcon {user} size={16} />
						<div class="flex flex-col">
							<p class="text-xl">{user.username}</p>
							<p>{user.id}</p>
						</div>
					</div>
					<div class="flex flex-row gap-4 pr-2 items-center">
						<div class="flex flex-wrap gap-2 text-right">
							{#each user.roles ?? [] as role}
								<p>{role}</p>
							{/each}
						</div>
						<Popover.Mobile>
							<div slot="trigger">
								<Button
									class="max-h-12"
									on:click={() => {
										manageMemberModal = true;
										selectedMemberId = user.id ?? '';
									}}
								>
									<Settings size={16} />
								</Button>
							</div>
							<div>Manage Permissions</div>
						</Popover.Mobile>
					</div>
				</div>
			{/each}
		</div>
		<Button
			on:click={() => {
				promoteMemberModal = true;
			}}
		>
			<span class="mr-2">Promote New Member</span>
			<Plus size={16} />
		</Button>
	</section>

	<section class="flex flex-col gap-4 w-full max-w-2xl items-center my-8">
		<h2 class="text-2xl">Badges</h2>
		<div class="flex flex-col gap-4 w-full">
			{#each data.badges as badge}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
				>
					<div class="flex flex-row gap-4 items-center">
						<img
							src="{PUBLIC_BADGE_IMAGE_URL}{badge.imageId}.png"
							alt={badge.name}
							class="w-24 h-8 rounded-sm object-cover"
						/>
						<div class="flex flex-col">
							<p class="text-xl font-semibold">{badge.name}</p>
							<p class="text-lg">{badge.description}</p>
							<p class="text-lg">{badge.requirements}</p>
						</div>
					</div>
					<div class="flex flex-row gap-4 pr-2">
						<div class="flex flex-col text-right gap-2">
							<Button
								on:click={() => {
									manageBadgeModal = true;
									selectedBadge = badge;
								}}
							>
								<Settings size={16} />
							</Button>
							<Button
								on:click={() => {
									grantBadgeModal = true;
									selectedBadge = badge;
								}}
							>
								<Plus size={16} />
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<Button
			on:click={() => {
				createBadgeModal = true;
			}}
		>
			<span class="mr-2">Create New Badge</span>
			<Plus size={16} />
		</Button>
	</section>

	<section class="flex flex-col gap-4 w-full max-w-2xl items-center my-8">
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

	<form method="post" action="?/clearcontests" class="flex flex-col gap-2 my-16" use:enhance>
		<Button type="submit" color="red">Clear Upcoming Contests</Button>
	</form>
</main>

<Dialog.Root bind:open={manageMemberModal}>
	<Dialog.Content>
		<Dialog.Title>Manage {selectedMember?.username} - {selectedMemberId}</Dialog.Title>
		<form
			method="post"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) manageMemberModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="id" bind:value={selectedMemberId} />

			<div class="space-y-2">
				<Label>Select Role</Label>
				<Select.Simple
					options={data.roles.map((p) => ({
						value: p,
						label: `${p}${selectedMember?.roles?.includes(p) ? ' (Active)' : ''}`,
					}))}
					bind:value={selectedPermission}
					placeholder="Select a role"
					name="role"
				/>
			</div>

			<div class="flex flex-row gap-2 items-center">
				<Button type="submit" formaction="?/promote">Add Role</Button>
				<Button type="submit" formaction="?/demote">Remove Role</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={promoteMemberModal}>
	<Dialog.Content>
		<Dialog.Title>Promote New Member</Dialog.Title>
		<form
			method="post"
			action="?/promote"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) promoteMemberModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col gap-2 items-start">
				<Label>Discord User ID</Label>
				<Input name="id" placeholder="Discord User ID" maxlength={20} />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Role</Label>
				<Select.Simple
					options={data.roles.map((p) => ({
						value: p,
						label: p,
					}))}
					bind:value={selectedPermission}
					placeholder="Select a role"
					name="role"
				/>
			</div>

			<Button type="submit">Add Role</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={manageBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>Edit Badge</Dialog.Title>
		<form
			method="post"
			action="?/editbadge"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) manageBadgeModal = false;
					update();
				};
			}}
		>
			{#if selectedBadge}
				<input type="hidden" name="badgeId" bind:value={selectedBadge.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Name</Label>
					<Input name="name" bind:value={selectedBadge.name} placeholder="Badge Name" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Image ID</Label>
					<Input name="imageId" bind:value={selectedBadge.imageId} placeholder="Badge Image ID" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Description</Label>
					<Input name="description" bind:value={selectedBadge.description} placeholder="Badge Description" />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Requirements</Label>
					<Input
						name="requirements"
						bind:value={selectedBadge.requirements}
						placeholder="Badge Requirements"
					/>
				</div>

				<Button type="submit">Edit</Button>
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={createBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>Create Badge</Dialog.Title>
		<form
			method="post"
			action="?/createbadge"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) createBadgeModal = false;
					update();
				};
			}}
		>
			<div class="flex flex-col gap-2 items-start">
				<Label>Name</Label>
				<Input name="name" placeholder="Badge Name" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Image ID</Label>
				<Input name="imageId" placeholder="Badge Image ID" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Description</Label>
				<Input name="description" placeholder="Badge Description" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Requirements</Label>
				<Input name="requirements" placeholder="Badge Requirements" />
			</div>

			<div class="flex flex-col gap-2 items-start">
				<Label>Tie To Account</Label>
				<Switch name="tied" />
			</div>

			<Button type="submit">Create</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={grantBadgeModal}>
	<Dialog.Content>
		<Dialog.Title>{grant ? 'Grant' : 'Remove'} User Badge</Dialog.Title>
		<form
			method="post"
			action={grant ? '?/adduserbadge' : '?/deleteuserbadge'}
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) grantBadgeModal = false;
					update();
				};
			}}
		>
			{#if selectedBadge}
				<input type="hidden" name="badgeId" bind:value={selectedBadge.id} />

				<div class="flex flex-col gap-2 items-start">
					<Label>Player UUID</Label>
					<Input name="uuid" placeholder="Player UUID" maxlength={36} />
				</div>

				<div class="flex flex-col gap-2 items-start">
					<Label>Mode Toggle</Label>
					<Switch bind:checked={grant} />
				</div>

				<Button type="submit">{grant ? 'Grant' : 'Remove'} Badge</Button>
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>

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
