<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import EntryPreview from '$comp/leaderboards/entry-preview.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import ArtistCredit from '$comp/shop/artist-credit.svelte';
	import Badge from '$comp/stats/badge.svelte';
	import { env } from '$env/dynamic/public';
	import type { FarmingWeightDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import { buildShopProductLdJson, shopKeywords } from '$lib/shop/seo';
	import { getTebex } from '$lib/tebex/index.svelte';
	import { Button } from '$ui/button';
	import * as Carousel from '$ui/carousel';
	import * as Dialog from '$ui/dialog';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Heart from '@lucide/svelte/icons/heart';
	import Image from '@lucide/svelte/icons/image';
	import Info from '@lucide/svelte/icons/info';
	import Package from '@lucide/svelte/icons/package';
	import Palette from '@lucide/svelte/icons/palette';
	import Replace from '@lucide/svelte/icons/replace';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Tag from '@lucide/svelte/icons/tag';
	import TicketX from '@lucide/svelte/icons/ticket-x';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let product = $derived(data.product);
	let productCategories = $derived(data.productCategories ?? []);
	let primaryCategory = $derived(data.primaryCategory);
	let relatedProducts = $derived(data.relatedProducts ?? []);
	let badge = $derived(data.badges.find((b) => b.id === product.features?.badgeId));
	let isFree = $derived(!product.price || product.price === 0);
	let dollars = $derived(((product.price ?? 0) / 100).toFixed(2));
	const globalContext = getGlobalContext();
	const tebex = getTebex();
	const isOwned = $derived.by(() => globalContext.authorized && globalContext.ownsProduct(product.id));
	const shouldPromptGiftCheckout = $derived(isOwned && !isFree);
	const supportsGifting = $derived(product.tebex?.supportsGifting ?? false);
	const canStartGiftCheckout = $derived(!shouldPromptGiftCheckout || supportsGifting);
	const productAction = $derived(tebex.getProductAction(product.id));
	const inCurrentCheckout = $derived.by(
		() => tebex.currentCheckout?.checkoutRequest.items.some((item) => item.productId === product.id) ?? false
	);
	const addButtonLabel = $derived.by(() => {
		if (shouldPromptGiftCheckout) {
			if (!supportsGifting) {
				return 'This Item Cannot Be Gifted';
			}

			if (productAction === 'adding') {
				return 'Creating Gift Checkout...';
			}

			return 'Add to Basket';
		}

		if (productAction === 'adding') {
			return isFree ? 'Adding Unlock...' : 'Adding to Basket...';
		}

		return inCurrentCheckout ? 'In Basket' : isFree ? 'Unlock' : 'Add to Basket';
	});
	const baseUrl = env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || '';
	const seoDescription = $derived.by(() => {
		const categoryText = primaryCategory ? ` from the ${primaryCategory.title} collection` : '';
		return (
			product.description?.trim() ||
			`Unlock ${product.name}${categoryText} in the Elite Shop with profile cosmetics, premium flair, and account perks.`
		);
	});
	const ldJson = $derived(buildShopProductLdJson(baseUrl, product, productCategories, seoDescription));

	const crumbs = $derived<Crumb[]>([{ name: 'Shop', href: '/shop' }, { name: product.name }]);

	const breadcrumb = getPageCtx();
	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});

	const leadPreviewStyle = $derived.by(() => {
		if (!product.weightStyles?.length) return null;
		const style = data.styles.find((s) => s.id === product.weightStyles[0].id);
		return style?.styleFormatter === 'data' ? style : null;
	});

	let claimModalOpen = $state(false);

	async function startGiftCheckout() {
		const checkoutUrl = inCurrentCheckout
			? '/shop/checkout?gift=1'
			: `/shop/checkout?gift=1&giftProduct=${encodeURIComponent(product.id)}`;
		await goto(checkoutUrl);
	}
</script>

<Head
	title={`${product.name ?? 'Product'} | Elite Shop`}
	description={seoDescription}
	keywords={shopKeywords}
	canonicalPath="/shop/{product.id}"
	imageUrl={product.thumbnail?.url ?? product.images?.[0]?.url}
	twitterCardType="summary_large_image"
	{ldJson}
/>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
	<div class="flex flex-wrap items-center gap-3">
		<a
			class="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors"
			href="/shop"
			data-sveltekit-preload-data="tap"
		>
			<ArrowLeft size={16} />
			Back to Shop
		</a>
		{#if primaryCategory}
			<a
				class="border-border/60 bg-background hover:bg-card inline-flex rounded-full border px-4 py-2 text-sm font-medium transition-colors"
				href="/shop/category/{primaryCategory.slug}"
				data-sveltekit-preload-data="tap"
			>
				View {primaryCategory.title}
			</a>
		{/if}
	</div>

	<div class="grid gap-12 lg:grid-cols-2">
		<div class="flex flex-col gap-6">
			<div class="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
				{#if product.images?.length || leadPreviewStyle}
					{@const totalSlides = (product.images?.length ?? 0) + (leadPreviewStyle ? 1 : 0)}
					<Carousel.Root class="w-full">
						<Carousel.Content>
							{#if leadPreviewStyle}
								<Carousel.Item>
									<div class="bg-background flex aspect-video w-full flex-col justify-center p-4">
										<div class="border-border/50 origin-left rounded-md border p-2 py-3">
											<div class="flex items-center gap-3 opacity-50 grayscale">
												<div class="bg-card-foreground/30 h-6 w-16 shrink-0 rounded"></div>
												<div class="flex flex-col gap-1">
													<div class="bg-card-foreground/30 h-5 w-24 rounded"></div>
													<div class="bg-card-foreground/30 h-3 w-16 rounded"></div>
												</div>
												<div class="bg-card-foreground/30 ml-auto h-6 w-24 rounded"></div>
											</div>
										</div>

										<div class="my-2 origin-left">
											<EntryPreview
												style={leadPreviewStyle.leaderboard ?? {}}
												ign={data.ign ?? 'Player'}
												uuid={data.uuid ?? ''}
												styleId={+(leadPreviewStyle.id ?? 0)}
												imageRefs={leadPreviewStyle.imageRefs}
											/>
										</div>

										<div class="border-border/50 origin-left rounded-md border p-2 py-3">
											<div class="flex items-center gap-3 opacity-50 grayscale">
												<div class="bg-card-foreground/30 h-6 w-16 shrink-0 rounded"></div>
												<div class="flex flex-col gap-1">
													<div class="bg-card-foreground/30 h-5 w-24 rounded"></div>
													<div class="bg-card-foreground/30 h-3 w-16 rounded"></div>
												</div>
												<div class="bg-card-foreground/30 ml-auto h-6 w-24 rounded"></div>
											</div>
										</div>
									</div>
								</Carousel.Item>
							{/if}

							<!-- Image Items -->
							{#each product.images ?? [] as image, i (i)}
								<Carousel.Item>
									<div class="flex flex-col">
										<div class="aspect-video w-full">
											<img
												src={image.url}
												alt={product.name}
												title={image.title}
												class="h-full w-full object-contain"
											/>
										</div>
										{#if image.description}
											<div class="bg-muted/30 border-t p-3 text-center text-sm font-medium">
												{image.title ? image.title + ': ' : ''}{image.description}
											</div>
										{/if}
									</div>
								</Carousel.Item>
							{/each}
						</Carousel.Content>
						{#if totalSlides > 1}
							<Carousel.Previous class="left-2" />
							<Carousel.Next class="right-2" />
						{/if}
					</Carousel.Root>
				{:else}
					<div class="bg-muted/30 flex aspect-video w-full items-center justify-center">
						<Package size={80} class="text-muted-foreground/30" />
					</div>
				{/if}
			</div>

			{#if product.isSubscription}
				<div class="max-w-none">
					<h3 class="font-semibold">Subscription access</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">
						These perks stay active while your subscription is live, and you can cancel whenever you want.
					</p>
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-8">
			<div>
				<h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">{product.name}</h1>
				{#if product.description}
					<p class="text-muted-foreground mt-2 max-w-lg text-base leading-relaxed">
						{product.description}
					</p>
				{/if}
				<div class="mt-4 flex items-baseline gap-2">
					{#if isFree}
						<span class="text-3xl font-bold">Free</span>
					{:else}
						<span class="text-3xl font-bold">${dollars}</span>
						<span class="text-muted-foreground text-lg">USD</span>
						{#if product.isSubscription}
							<span class="text-muted-foreground text-lg">/ month</span>
						{/if}
					{/if}
				</div>

				{#if productCategories.length}
					<div class="mt-3 flex flex-wrap gap-2">
						{#each productCategories as category (category.id)}
							<a
								href="/shop/category/{category.slug}"
								class="border-border/60 bg-background inline-flex rounded-full border px-3 py-1 text-sm font-medium"
								data-sveltekit-preload-data="tap"
							>
								{category.title}
							</a>
						{/each}
					</div>
				{/if}
			</div>
			<div class="flex flex-col gap-4">
				{#if isFree && product.type === 2}
					<Button
						onclick={() => (claimModalOpen = true)}
						size="lg"
						class="w-full text-lg font-semibold"
						disabled={isOwned}
					>
						{isOwned ? 'Already Unlocked' : 'Unlock Now'}
					</Button>
				{:else}
					<Button
						onclick={() => (shouldPromptGiftCheckout ? startGiftCheckout() : tebex.addToBasket(product.id))}
						size="lg"
						class="w-full text-lg font-semibold"
						disabled={!canStartGiftCheckout ||
							productAction === 'adding' ||
							(!shouldPromptGiftCheckout && inCurrentCheckout)}
					>
						{addButtonLabel}
					</Button>
					{#if shouldPromptGiftCheckout}
						<Button href="/shop" size="lg" variant="secondary" class="w-full text-lg font-semibold">
							Continue Shopping
						</Button>
					{/if}
				{/if}
				{#if shouldPromptGiftCheckout}
					<div class="bg-primary/6 border-primary/20 flex items-start gap-3 rounded-lg border p-4 text-sm">
						<Info class="text-primary mt-0.5 shrink-0" size={16} />
						<p class="text-muted-foreground">
							{#if supportsGifting}
								You already own this item on your account. If you want another copy, start a gift
								checkout and choose the player on the checkout page.
							{:else}
								You already own this item on your account, and this product is not eligible for gift
								checkout.
							{/if}
						</p>
					</div>
				{/if}
				{#if inCurrentCheckout}
					<div class="bg-muted/50 flex items-start gap-3 rounded-lg p-4 text-sm">
						<Info class="text-primary mt-0.5 shrink-0" size={16} />
						<p class="text-muted-foreground">
							{#if shouldPromptGiftCheckout}
								This gift item is already in your basket. Open checkout to choose who should receive it.
							{:else}
								This item is already in your basket, so it will be included automatically when you
								checkout.
							{/if}
						</p>
					</div>
				{/if}

				<div class="border-border/60 bg-card/70 rounded-xl border p-4 text-sm">
					<p class="text-muted-foreground leading-relaxed">
						Manage your items in <a href="/profile/purchases" class="text-link hover:underline"
							>purchase history</a
						>
						or equip cosmetics from
						<a href="/profile/settings" class="text-link hover:underline">profile settings</a>.
					</p>
				</div>
			</div>

			<div class="border-border rounded-xl border p-6">
				<h3 class="mb-4 text-xl font-semibold">What you'll unlock</h3>
				{#snippet featureRow(Icon: typeof Image, title: string, description: string)}
					<div class="flex gap-3">
						<div
							class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
						>
							<Icon size={20} />
						</div>
						<div>
							<p class="mb-0.5 leading-none font-medium">{title}</p>
							<p class="text-muted-foreground text-sm">{description}</p>
						</div>
					</div>
				{/snippet}
				<div class="flex flex-col gap-4">
					{#if product.weightStyles?.length}
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<Image size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Cosmetic Styles</p>
								<p class="text-muted-foreground text-sm">
									Adds {product.weightStyles.length} style{product.weightStyles.length > 1 ? 's' : ''}
									you can use across Elite.
								</p>
							</div>
						</div>
					{/if}

					{#if product.features?.embedColors?.length}
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<Palette size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Embed Colors</p>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each product.features.embedColors as color (color)}
										<div
											class="h-4 w-4 rounded-full border border-white/10 shadow-sm"
											style="background-color: #{color}"
											title="#{color}"
										></div>
									{/each}
								</div>
							</div>
						</div>
					{/if}

					{#if badge}
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<Tag size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Profile Badge</p>
								<div class="mt-1">
									<Badge {badge} />
								</div>
							</div>
						</div>
					{/if}

					{#if product.features?.customEmoji}
						{@render featureRow(
							Heart,
							'Custom Emoji',
							'Display a custom emoji next to your name everywhere.'
						)}
					{/if}

					{#if product.features?.hideShopPromotions}
						{@render featureRow(TicketX, 'Cleaner commands', 'Hide shop promos in supported bot commands.')}
					{/if}

					{#if product.features?.weightStyleOverride}
						{@render featureRow(
							Replace,
							'Show your style everywhere',
							'Use this look whenever someone views your profile.'
						)}
					{/if}

					{#if product.features?.moreInfoDefault}
						{@render featureRow(
							ScrollText,
							'Detailed stats by default',
							'Open /weight with extra detail turned on.'
						)}
					{/if}

					<p class="text-muted-foreground text-sm">
						Most cosmetics can be equipped any time from <a
							href="/profile/settings"
							class="text-link hover:underline">profile settings</a
						>.
					</p>
				</div>
			</div>
		</div>
	</div>

	{#if product.weightStyles?.length}
		<section id="styles" class="mt-24 scroll-mt-24">
			<div class="mb-8 flex items-center gap-4">
				<div class="bg-border h-px flex-1"></div>
				<h2 class="text-3xl font-bold">Style previews</h2>
				<div class="bg-border h-px flex-1"></div>
			</div>

			<div class="grid gap-8">
				{#each [...product.weightStyles].sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0) as { id } (id)}
					{@const style = data.styles.find((s) => s.id === id)}
					{#if style}
						<div class="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
							<div class="bg-muted/30 border-b px-6 py-4">
								<div class="flex items-center justify-between">
									<div class="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-center">
										<h3 class="text-xl font-bold">{style.name}</h3>
										{#if style.author}
											<ArtistCredit artist={style.author} />
										{/if}
									</div>
									{#if style.styleFormatter !== 'data'}
										<span class="text-muted-foreground text-sm italic">Preview unavailable</span>
									{/if}
								</div>
							</div>

							<div class="p-6">
								{#if style?.styleFormatter === 'data'}
									<div class="flex flex-col gap-8 lg:flex-row">
										<div class="flex-1">
											<h4
												class="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase"
											>
												Command Preview
											</h4>
											<div class="origin-center scale-[0.8] sm:scale-100">
												<WeightStyle
													{style}
													ign={data.ign ?? 'Player'}
													uuid={data.uuid ?? ''}
													weight={data.weight ?? ({ totalWeight: 10000 } as FarmingWeightDto)}
												/>
											</div>
										</div>

										{#if style?.leaderboard && Object.keys(style.leaderboard).length > 0}
											<div class="flex-1">
												<h4
													class="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase"
												>
													Leaderboard Preview
												</h4>
												<div class="origin-center scale-[0.8] sm:scale-100">
													<EntryPreview
														style={style.leaderboard}
														ign={data.ign ?? 'Player'}
														uuid={data.uuid ?? ''}
														styleId={style.id}
														imageRefs={style.imageRefs}
													/>
												</div>
											</div>
										{/if}
									</div>
								{:else}
									<p class="text-muted-foreground">{style.description}</p>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	{#if relatedProducts.length}
		<section class="space-y-6">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 class="text-3xl font-black tracking-tight sm:text-4xl">You might also like</h2>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
				{#each relatedProducts as relatedProduct (relatedProduct.id)}
					<ProductCard product={relatedProduct} class="w-full max-w-none" />
				{/each}
			</div>
		</section>
	{/if}
</div>

<Dialog.Root bind:open={claimModalOpen}>
	<Dialog.ScrollContent>
		<Dialog.Title>Unlock {product.name}</Dialog.Title>
		<div class="mt-4 flex flex-col gap-4">
			<p>This item is free! Claim it to add it to your account instantly.</p>

			<form action="?/claim" method="post" class="w-full" use:enhance>
				<input type="hidden" name="sku" value={product.id} />
				<Button type="submit" class="w-full font-semibold" size="lg">Claim Now</Button>
			</form>
		</div>
	</Dialog.ScrollContent>
</Dialog.Root>
