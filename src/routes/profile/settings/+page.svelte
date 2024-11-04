<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import Product from '$comp/monetization/product.svelte';
	import { Button } from '$ui/button';
	import { Switch } from '$ui/switch';
	import { onMount } from 'svelte';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { Label } from '$ui/label';
	import { SelectSimple } from '$ui/select';
	import * as Card from '$ui/card';
	import type { PageData, ActionData } from './$types';
	import ComboBox from '$comp/ui/combobox/combo-box.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';

	export let data: PageData;
	export let form: ActionData;
	let loading = false;

	$: user = data.user || undefined;

	$: badges = mapBadges(user?.minecraftAccounts ?? []);

	function mapBadges(accounts: PageData['user']['minecraftAccounts'] = []) {
		return accounts
			.filter((mc) => mc.badges && mc.badges.length > 0)
			.map((mc) => ({
				name: mc.name,
				uuid: mc.id,
				badges: mc.badges?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
			}));
	}

	$: visibleToggles = {} as Record<string, boolean>;

	onMount(() => {
		visibleToggles = badges.reduce<Record<string, boolean>>((acc, mc) => {
			mc.badges?.forEach((badge) => {
				acc[`${mc.uuid}-${badge.id}`] = badge.visible ?? false;
			});
			return acc;
		}, {});
	});

	$: unlockedSettings = {
		weightStyle: data.user.entitlements?.some((e) => (e.product?.weightStyles?.length ?? 0) > 0) ?? false,
		embedColor: data.user.entitlements?.some((e) => (e.product.features?.embedColors?.length ?? 0) > 0) ?? false,
		shopPromotions: data.user.entitlements?.some((e) => e.product.features?.hideShopPromotions) ?? false,
		styleOverride: data.user.entitlements?.some((e) => e.product.features?.weightStyleOverride) ?? false,
		moreInfo: data.user.entitlements?.some((e) => e.product.features?.moreInfoDefault) ?? false,
	};

	let changedSettings = {
		weightStyle: (data.user.settings?.weightStyle?.id ?? '-1') as string | undefined,
		embedColor: data.user.settings?.features?.embedColor ?? '',
		shopPromotions: data.user.settings?.features?.hideShopPromotions ?? false,
		styleOverride: data.user.settings?.features?.weightStyleOverride ?? false,
		moreInfo: data.user.settings?.features?.moreInfoDefault ?? false,
	};

	$: selectedStyle = changedSettings.weightStyle
		? data.styles?.find((s) => s.id === +(changedSettings.weightStyle ?? '-1'))
		: undefined;

	$: unlockedWeightStyles = (data.user.entitlements ?? [])
		.filter((e) => (e.product?.weightStyles?.length ?? 0) > 0)
		.map((e) => e.product?.weightStyles ?? [])
		.flat()
		.reduce((acc, e) => {
			if (!e.id || !e.name) return acc;
			acc[e.id] = { value: e.id.toString(), label: e.name };
			return acc;
		}, {} as Record<string, { label: string; value: string }>);

	$: weightStyleOptions = [{ label: 'Default', value: '-1' }, ...Object.values(unlockedWeightStyles)];

	$: unlockedEmbedColors = [
		...new Set(
			(data.user.entitlements ?? [])
				.filter((e) => (e.product.features?.embedColors?.length ?? 0) > 0)
				.map((e) => e.product.features?.embedColors ?? [])
				.flat()
		),
	];

	$: embedColorOptions = [
		{ label: 'Default', value: '' },
		...unlockedEmbedColors.map((e) => ({ label: e, value: e, color: '#' + e })),
	];
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<main class="flex flex-col lg:flex-row justify-start gap-16 my-16 justify-items-center">
	<section class="flex flex-col max-w-3xl w-full">
		<h1 class="text-4xl mb-4">Purchases</h1>
		{#if data.user.entitlements?.length === 0}
			<p class="mb-2">
				You don't have any shop purchases! Check out the <a href="/shop" class="text-blue-400 hover:underline"
					>Discord Shop!</a
				>
			</p>
		{:else}
			<p class="mb-2">
				Check out the <a href="/shop" class="text-blue-400 hover:underline">Discord Shop!</a>
			</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense">
			{#each data.user.entitlements ?? [] as purchase (purchase.id)}
				<Product product={purchase.product} />
			{/each}
		</div>
		<form
			action="?/refreshPurchases"
			method="post"
			class="mt-2 mb-16"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					// Wait for a bit so the user can see the loading state
					await new Promise((r) => setTimeout(r, 500));
					loading = false;
					await invalidateAll();
					await applyAction(result);
				};
			}}
		>
			<Button type="submit" disabled={loading} variant="secondary">Refresh Purchases</Button>
		</form>

		{#if form?.error}
			<p class="text-red-500">{form.error}</p>
		{/if}

		<h1 class="text-2xl mb-2">User Settings</h1>
		<p class="mb-4">Configure settings here! Only things that you've paid for are available to edit.</p>
		<form
			action="?/updateSettings"
			method="post"
			class="flex flex-col gap-4 mb-12 max-w-md"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					// Wait for a bit so the user can see the loading state
					await new Promise((r) => setTimeout(r, 500));
					loading = false;
					await invalidateAll();
					await applyAction(result);
				};
			}}
		>
			<div class="space-y-2 flex flex-col">
				<Label>Weight Command Style</Label>
				<ComboBox
					disabled={loading || !unlockedSettings.weightStyle}
					options={weightStyleOptions}
					bind:value={changedSettings.weightStyle}
					placeholder="Select Style"
				/>
				<input type="hidden" name="style" bind:value={changedSettings.weightStyle} />

				{#if selectedStyle}
					<Card.Root class="w-full">
						<Card.Content class="p-2 w-full">
							<!-- {#if selectedStyle.description}
								<p class="text-sm pb-1">{selectedStyle.description}</p>
							{/if} -->
							{#if selectedStyle.styleFormatter === 'data'}
								{#key selectedStyle.id}
									<WeightStyle
										style={selectedStyle}
										ign={data.mcAccount?.name ?? ''}
										uuid={data.mcAccount?.id ?? ''}
										weight={data.weight ?? undefined}
									/>
								{/key}
							{:else}
								<p class="text-sm text-gray-500">
									No preview available! You can change to this style and run the /&NoBreak;weight
									command in Discord to see it.
								</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
			<div class="space-y-2">
				<Label>Bot Embed Color</Label>
				<SelectSimple
					name="embed"
					options={embedColorOptions}
					bind:value={changedSettings.embedColor}
					disabled={loading || !unlockedSettings.embedColor}
				/>
			</div>
			<div class="flex flex-row gap-2 items-center">
				<Switch
					bind:checked={changedSettings.shopPromotions}
					disabled={loading || !unlockedSettings.shopPromotions}
				/>
				<Label>Hide shop promotions</Label>
				<input type="hidden" name="promotions" bind:value={changedSettings.shopPromotions} />
			</div>
			<div class="flex flex-row gap-2 items-center">
				<Switch
					bind:checked={changedSettings.styleOverride}
					disabled={loading || !unlockedSettings.styleOverride}
				/>
				<Label>Apply Weight Style on everyone</Label>
				<input type="hidden" name="override" bind:value={changedSettings.styleOverride} />
			</div>
			<div class="flex flex-row gap-2 items-center">
				<Switch bind:checked={changedSettings.moreInfo} disabled={loading || !unlockedSettings.moreInfo} />
				<Label>"More Info" in weight command by default</Label>
				<input type="hidden" name="info" bind:value={changedSettings.moreInfo} />
			</div>
			<Button type="submit" class="max-w-fit" disabled={loading}>Update Settings</Button>
		</form>

		<h1 class="text-2xl mb-4">Manage Badges</h1>
		{#if !user.minecraftAccounts?.some((mc) => mc.badges && mc.badges.length > 0)}
			<p class="mb-16">You don't have any badges yet!</p>
		{/if}
		{#each badges as profile (profile.uuid)}
			{@const length = profile.badges?.length ?? 0}
			<form
				action="?/updateBadges"
				method="post"
				class="flex flex-col gap-4"
				use:enhance={() => {
					loading = true;
					return async ({ result }) => {
						// Wait for a bit so the user can see the loading state
						await new Promise((r) => setTimeout(r, 500));
						loading = false;
						await invalidateAll();
						await applyAction(result);
					};
				}}
			>
				<h3 class="text-xl mt-4">Badges for {profile.name}</h3>
				{#each profile?.badges ?? [] as badge, i (badge.id ?? i)}
					{@const id = badge.id ?? ''}
					<div class="flex flex-row gap-4 items-center">
						<input type="hidden" name="badge.{id}" value={id} />
						<input type="hidden" name="badge.{id}.order" value={i} />
						<Switch bind:checked={visibleToggles[`${profile.uuid}-${badge.id}`]} />
						<input
							type="hidden"
							name="badge.{id}.visible"
							value={visibleToggles[`${profile.uuid}-${badge.id}`]}
						/>
						{#if badge.image?.url}
							<img
								src={badge.image.url}
								alt={badge.name}
								class="w-18 h-6 md:w-24 md:h-8 rounded-sm object-cover"
							/>
						{/if}
						<div class="flex flex-row gap-1">
							<Button
								size="sm"
								disabled={i === 0 || length === 1}
								on:click={() => {
									const newOrder = Math.max(i - 1, 0);
									const old = profile.badges?.find((b) => b.order === newOrder);
									if (old) old.order = i;
									badge.order = newOrder;
									badges = badges;
								}}
							>
								<ArrowUp size={16} />
							</Button>
							<Button
								size="sm"
								disabled={i === length - 1 || length === 1}
								on:click={() => {
									const newOrder = Math.min(i + 1, length);
									const old = profile.badges?.find((b) => b.order === newOrder);
									if (old) old.order = i;
									badge.order = newOrder;
									badges = badges;
								}}
							>
								<ArrowDown size={16} />
							</Button>
						</div>
						<div class="flex flex-1 flex-col gap-1 max-w-md">
							<p class="text-lg font-semibold">{badge.name}</p>
							<p>{badge.description}</p>
						</div>
					</div>
				{/each}
				<input type="hidden" name="uuid" value={profile.uuid} />
				<Button type="submit" class="max-w-fit" disabled={loading}>Update Badges</Button>
			</form>
		{/each}
	</section>
</main>
