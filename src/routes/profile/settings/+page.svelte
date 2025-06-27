<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import Product from '$comp/monetization/product.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import ComboBox from '$comp/ui/combobox/combo-box.svelte';
	import { getThemeContext, themes } from '$lib/stores/themes.svelte';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import * as Carousel from '$ui/carousel';
	import type { CarouselAPI } from '$ui/carousel/context.js';
	import { SelectSimple } from '$ui/select';
	import { Switch } from '$ui/switch';
	import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
	import Menu from '@lucide/svelte/icons/menu';
	import Moon from '@lucide/svelte/icons/moon';
	import Search from '@lucide/svelte/icons/search';
	import Sun from '@lucide/svelte/icons/sun';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import BadgeConfig from './badge-config.svelte';
	import EmojiDialog from '$comp/emoji/emoji-dialog.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingHeader from '$comp/settings/setting-header.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { useDebounce } from 'runed';

	let api = $state<CarouselAPI>();

	const themeContext = getThemeContext();
	const wheelGestures = WheelGesturesPlugin();

	let current = $state(0);
	let themeName = $state('');
	let themeClass = $state('');

	$effect(() => {
		if (api) {
			current = api.selectedScrollSnap() + 1;
			api.on('select', () => {
				current = api!.selectedScrollSnap() + 1;
			});
			themeName = themes[current - 1].name;
			themeClass = themes[current - 1].class;
		}
	});

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);

	let purchases = $derived(
		Object.values(
			Object.groupBy(
				(data.user?.entitlements ?? []).sort((a, b) => (!a.endDate ? 1 : +a.endDate - +(b.endDate ?? 0))),
				(e) => e.product?.id
			)
		).map((p) => p?.[0]) ?? []
	);

	function mapBadges(accounts: PageData['user']['minecraftAccounts'] = []) {
		return accounts
			.filter((mc) => mc.badges && mc.badges.length > 0)
			.map((mc) => ({
				name: mc.name,
				uuid: mc.id,
				badges: mc.badges?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
			}));
	}

	let changedSettings = $state({
		weightStyle: (data.user.settings?.weightStyle?.id ?? '-1') as string | undefined,
		embedColor: data.user.settings?.features?.embedColor ?? '',
		shopPromotions: data.user.settings?.features?.hideShopPromotions ?? false,
		styleOverride: data.user.settings?.features?.weightStyleOverride ?? false,
		moreInfo: data.user.settings?.features?.moreInfoDefault ?? false,
		emoji: data.user.settings?.suffix ?? '',
	});

	let updateForm: HTMLFormElement | undefined = $state(undefined);

	const updateSettings = useDebounce(() => {
		const settings = data.user.settings;
		if (
			!settings ||
			changedSettings.weightStyle !== settings.weightStyle?.id?.toString() ||
			changedSettings.embedColor !== settings.features?.embedColor ||
			changedSettings.shopPromotions !== settings.features?.hideShopPromotions ||
			changedSettings.styleOverride !== settings.features?.weightStyleOverride ||
			changedSettings.moreInfo !== settings.features?.moreInfoDefault ||
			(changedSettings.emoji !== settings.suffix && unlockedSettings.emoji)
		) {
			updateForm?.requestSubmit();
		}
	}, 1000);

	let user = $derived(data.user || undefined);
	let badges = $state(mapBadges(data.user?.minecraftAccounts ?? []));

	let unlockedSettings = $derived({
		weightStyle: data.user.entitlements?.some((e) => (e.product?.weightStyles?.length ?? 0) > 0) ?? false,
		embedColor: data.user.entitlements?.some((e) => (e.product.features?.embedColors?.length ?? 0) > 0) ?? false,
		shopPromotions: data.user.entitlements?.some((e) => e.product.features?.hideShopPromotions) ?? false,
		styleOverride: data.user.entitlements?.some((e) => e.product.features?.weightStyleOverride) ?? false,
		moreInfo: data.user.entitlements?.some((e) => e.product.features?.moreInfoDefault) ?? false,
		emoji: data.user.entitlements?.some((e) => e.product.features?.customEmoji) ?? false,
	});

	let selectedStyle = $derived(
		changedSettings.weightStyle
			? data.styles?.find((s) => s.id === +(changedSettings.weightStyle ?? '-1'))
			: undefined
	);

	let unlockedWeightStyles = $derived(
		(data.user.entitlements ?? [])
			.filter((e) => (e.product?.weightStyles?.length ?? 0) > 0)
			.map((e) => e.product?.weightStyles ?? [])
			.flat()
			.reduce(
				(acc, e) => {
					if (!e.id || !e.name) return acc;
					acc[e.id] = { value: e.id.toString(), label: e.name };
					return acc;
				},
				{} as Record<string, { label: string; value: string }>
			)
	);

	let weightStyleOptions = $derived([{ label: 'Default', value: '-1' }, ...Object.values(unlockedWeightStyles)]);
	let unlockedEmbedColors = $derived([
		...new Set(
			(data.user.entitlements ?? [])
				.filter((e) => (e.product.features?.embedColors?.length ?? 0) > 0)
				.map((e) => e.product.features?.embedColors ?? [])
				.flat()
		),
	]);

	let embedColorOptions = $derived([
		{ label: 'Default', value: '' },
		...unlockedEmbedColors.map((e) => ({ label: e, value: e, color: '#' + e })),
	]);

	onMount(() => {
		if (window.location.hash) {
			document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
		}
	});
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="my-16 flex flex-col justify-start justify-items-center gap-16 lg:flex-row">
	<section class="flex w-full max-w-3xl flex-col">
		<h1 class="mb-4 text-4xl">Purchases</h1>
		{#if purchases.length === 0}
			<p class="mb-2">
				You don't have any shop purchases! Check out the <a href="/shop" class="text-link hover:underline"
					>Shop!</a
				>
			</p>
		{:else}
			<p class="mb-2">
				Check out the <a href="/shop" class="text-link hover:underline">Shop!</a>
			</p>
		{/if}
		<div class="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
			{#each purchases as purchase (purchase?.id)}
				{#if purchase?.product}
					<Product product={purchase.product} />
				{/if}
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
			<p class="text-destructive">{form.error}</p>
		{/if}

		<form
			action="?/updateSettings"
			method="post"
			class="bg-card mb-12 flex max-w-4xl flex-col gap-4 rounded-lg border-2 p-4"
			bind:this={updateForm}
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
			<SettingHeader class="flex flex-col items-start font-normal">
				<span class="mb-2 text-2xl">User Settings</span>
				<br />
				<span class="text-sm"
					>Configure settings here! Only things that you've paid for are available to edit.</span
				>
			</SettingHeader>
			<SettingSeperator />
			<SettingListItem
				title="Weight Command Style"
				description="Select a style for the weight command in Discord!"
			>
				<ComboBox
					disabled={loading || !unlockedSettings.weightStyle}
					options={weightStyleOptions}
					bind:value={changedSettings.weightStyle}
					placeholder="Select Style"
					onChange={updateSettings}
				/>
				<input type="hidden" name="style" bind:value={changedSettings.weightStyle} />
				{#if selectedStyle}
					<Card.Root class="w-full p-0">
						<Card.Content class="w-full p-2">
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
								<p class="text-muted-variant text-sm">
									No preview available! You can change to this style and run the /&NoBreak;weight
									command in Discord to see it.
								</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem title="Bot Embed Color" description="Select an accent color for bot responses in Discord!">
				<SelectSimple
					name="embed"
					options={embedColorOptions}
					bind:value={changedSettings.embedColor}
					disabled={loading || !unlockedSettings.embedColor}
					change={updateSettings}
				/>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Custom Emoji"
				description="Set a custom emoji to be shown next to your linked account's name!"
			>
				<div class="flex flex-row items-center gap-4">
					<span class="text-2xl"
						>{data.mcAccount?.name ?? data.session?.username ?? ''} {changedSettings.emoji}</span
					>
					<EmojiDialog
						ign={data.mcAccount?.name ?? data.session?.username ?? ''}
						bind:selected={changedSettings.emoji}
						name="emoji"
						onChange={() => {
							if (unlockedSettings.emoji) {
								updateSettings();
							}
						}}
					>
						{#snippet trigger()}
							<Pencil />
						{/snippet}
					</EmojiDialog>
					<input type="hidden" name="emoji" bind:value={changedSettings.emoji} />
				</div>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Hide Shop Promotions"
				description="Toggle whether to hide shop promotions in bot commands."
			>
				<div class="flex flex-row items-center gap-2">
					<Switch
						bind:checked={changedSettings.shopPromotions}
						disabled={loading || !unlockedSettings.shopPromotions}
						name="promotions"
						onCheckedChange={updateSettings}
					/>
				</div>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Override Weight Style"
				description="Toggle whether to apply your weight style on everyone you look up."
			>
				<div class="flex flex-row items-center gap-2">
					<Switch
						bind:checked={changedSettings.styleOverride}
						disabled={loading || !unlockedSettings.styleOverride}
						name="override"
						onCheckedChange={updateSettings}
					/>
				</div>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Default 'More Info'"
				description="Toggle whether the 'More Info' section is shown by default in the weight command."
			>
				<div class="flex flex-row items-center gap-2">
					<Switch
						bind:checked={changedSettings.moreInfo}
						disabled={loading || !unlockedSettings.moreInfo}
						name="info"
						onCheckedChange={updateSettings}
					/>
				</div>
			</SettingListItem>
			<div class="flex flex-col items-end gap-2">
				<Button type="submit" class="max-w-fit" disabled={loading}>Update Settings</Button>
			</div>
		</form>

		<h1 class="mb-4 text-2xl">Manage Badges</h1>
		{#if !user.minecraftAccounts?.some((mc) => mc.badges && mc.badges.length > 0)}
			<p class="mb-16">You don't have any badges yet!</p>
		{/if}
		{#each badges as profile (profile.uuid)}
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
				<h3 class="mt-4 text-xl">Badges for {profile.name}</h3>

				<BadgeConfig badges={profile.badges ?? []} />

				<input type="hidden" name="uuid" value={profile.uuid} />
				<Button type="submit" class="max-w-fit" disabled={loading}>Update Badges</Button>
			</form>
		{/each}

		<h1 class="mt-10 mb-10 scroll-mt-32 text-2xl" id="themes">Themes</h1>
		<div class="mx-0 flex flex-col items-center justify-center md:mx-16">
			<Carousel.Root
				setApi={(emblaApi) => (api = emblaApi)}
				class="w-full max-w-2xl"
				opts={{
					loop: true,
				}}
				plugins={[wheelGestures]}
			>
				<Carousel.Content>
					{#each themes as theme (theme.name)}
						<Carousel.Item class="">
							<Card.Root class={theme.class} style="color-scheme: {theme.class}">
								<Card.Content
									class="bg-background flex aspect-video items-center justify-center rounded-lg p-6"
									style="color-scheme: {theme.class};"
								>
									<!-- Theme Preview -->
									<div class="w-full rounded-lg">
										<!-- nav header -->
										<div class="mb-4 flex items-center justify-between border-b pb-2">
											<div class="flex items-center gap-2">
												<img
													src="/favicon.webp"
													class="aspect-square max-w-5"
													alt="Elite Logo"
												/>
												<Menu class="text-foreground h-5 w-5" />
											</div>
											<div class="flex items-center gap-2">
												<div
													class="bg hover:bg-muted flex h-8 items-center rounded-sm border px-3"
												>
													<Search class="text-muted-foreground h-4 w-4" />
													<span class="text-muted-foreground ml-2 text-sm">Search...</span>
												</div>
												{#if theme.isDark}
													<Moon class="text-foreground h-5 w-5" />
												{:else}
													<Sun class="text-foreground h-5 w-5" />
												{/if}
											</div>
										</div>
										<!-- rest of the preview -->
										<div class="space-y-4">
											<div class="bg-muted h-5 w-1/4 rounded"></div>
											<div class="bg-muted h-4 w-1/2 rounded"></div>
											<div class="bg-muted h-4 w-3/5 rounded"></div>
											<div class="bg-muted h-4 w-3/4 rounded"></div>
											<div class="bg-muted h-4 w-3/4 rounded"></div>
											<div class="flex gap-2">
												<button
													onclick={() => console.log('hey dont touch me!')}
													aria-label="Theme preview button"
													class="border-border bg-primary hover:bg-accent h-9 w-8 rounded border-2 px-8"
												></button>
												<div class="bg-muted h-9 flex-1 rounded"></div>
											</div>
											<div class="grid grid-cols-2 gap-2">
												<div class="bg-muted-variant h-16 rounded"></div>
												<div class="bg-muted-variant h-16 rounded"></div>
											</div>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						</Carousel.Item>
					{/each}
				</Carousel.Content>
				<Carousel.Previous class="hidden md:flex" />
				<Carousel.Next class="hidden md:flex" />
			</Carousel.Root>
			<div class="text-muted-foreground py-4 text-center text-lg">
				{themeName}
			</div>
		</div>
		<div class="flex justify-start">
			<Button class="px-4 py-2" onclick={() => (themeContext.theme = themeClass)}>Apply Theme</Button>
		</div>
	</section>
</div>
