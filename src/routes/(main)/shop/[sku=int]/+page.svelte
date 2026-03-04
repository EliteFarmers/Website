<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import EntryPreview from '$comp/leaderboards/entry-preview.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import Badge from '$comp/stats/badge.svelte';
	import type { FarmingWeightDto } from '$lib/api';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import { Button } from '$ui/button';
	import * as Carousel from '$ui/carousel';
	import * as Dialog from '$ui/dialog';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ExternalLink from '@lucide/svelte/icons/external-link';
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
	let badge = $derived(data.badges.find((b) => b.id === product.features?.badgeId));
	let isFree = $derived(!product.price || product.price === 0);
	let dollars = $derived(((product.price ?? 0) / 100).toFixed(2));

	const crumbs = $derived<Crumb[]>([{ name: 'Shop', href: '/shop' }, { name: product.name }]);

	const breadcrumb = getPageCtx();
	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});

	let claimModalOpen = $state(false);
</script>

<Head
	title={product.name ?? 'Product'}
	description="Help support development with cosmetics!"
	canonicalPath="/shop/{product.id}"
/>

<div class="container mx-auto max-w-6xl px-4 py-12">
	<a
		class="text-muted-foreground hover:text-primary mb-8 flex items-center gap-2 text-sm font-medium transition-colors"
		href="/shop"
	>
		<ArrowLeft size={16} />
		Back to Shop
	</a>

	<div class="grid gap-12 lg:grid-cols-2">
		<div class="flex flex-col gap-6">
			<div class="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
				{#if product.images?.length || (product.weightStyles?.length && data.styles.find((s) => s.id === product.weightStyles[0].id)?.styleFormatter === 'data')}
					{@const hasPreview =
						product.weightStyles?.length &&
						data.styles.find((s) => s.id === product.weightStyles[0].id)?.styleFormatter === 'data'}
					{@const totalSlides = (product.images?.length ?? 0) + (hasPreview ? 1 : 0)}
					<Carousel.Root class="w-full">
						<Carousel.Content>
							{#if hasPreview}
								{@const style = data.styles.find((s) => s.id === product.weightStyles[0].id)}
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
												style={style?.leaderboard ?? {}}
												ign={data.ign ?? 'Player'}
												uuid={data.uuid ?? ''}
												styleId={+(style?.id ?? 0)}
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

			<!-- Description -->
			{#if product.description}
				<div class="max-w-none">
					<h3 class="text-lg font-semibold">About This Item</h3>
					<p class="text-muted-foreground leading-relaxed">
						{product.description}
					</p>
				</div>
			{/if}

			{#if product.isSubscription}
				<div class="max-w-none">
					<h3 class="font-semibold">Subscription Item</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">
						This item is a subscription, the perks that you receive will only be active while you have a
						valid subscription. You can cancel your subscription at any time!
					</p>
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-8">
			<div>
				<h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">{product.name}</h1>
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
			</div>

			<div class="flex flex-col gap-4">
				{#if isFree && product.type == 2}
					<Button onclick={() => (claimModalOpen = true)} size="lg" class="w-full text-lg font-semibold">
						Unlock Now
					</Button>
				{:else}
					<Button href="/shop/{product.id}/buy" size="lg" class="w-full text-lg font-semibold">
						{isFree ? 'Unlock' : 'Buy'} on Discord
						<ExternalLink size={20} class="ml-2" />
					</Button>
				{/if}
				{#if isFree}
					<div class="bg-muted/50 flex items-start gap-3 rounded-lg p-4 text-sm">
						<Info class="text-primary mt-0.5 shrink-0" size={16} />
						<p class="text-muted-foreground">
							Discord requires billing info even for free items. You won't be charged.
						</p>
					</div>
				{/if}
			</div>

			<div class="border-border rounded-xl border p-6">
				<h3 class="mb-4 text-xl font-semibold">Features Unlocked</h3>
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
									Unlocks {product.weightStyles.length} style{product.weightStyles.length > 1
										? 's'
										: ''} for your profile and commands.
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
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<Heart size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Custom Emoji</p>
								<p class="text-muted-foreground text-sm">
									Display a custom emoji next to your name everywhere.
								</p>
							</div>
						</div>
					{/if}

					<!-- Generic feature list for other items -->
					{#if product.features?.hideShopPromotions}
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<TicketX size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Hide Shop Promotions</p>
								<p class="text-muted-foreground text-sm">Disable shop ads in bot commands.</p>
							</div>
						</div>
					{/if}

					{#if product.features?.weightStyleOverride}
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<Replace size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Global Style Override</p>
								<p class="text-muted-foreground text-sm">
									Your style appears for everyone you look up.
								</p>
							</div>
						</div>
					{/if}

					{#if product.features?.moreInfoDefault}
						<div class="flex gap-3">
							<div
								class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
								<ScrollText size={20} />
							</div>
							<div>
								<p class="mb-0.5 leading-none font-medium">Default "More Info"</p>
								<p class="text-muted-foreground text-sm">Always show detailed stats in /weight.</p>
							</div>
						</div>
					{/if}

					<p class="text-muted-foreground text-sm">
						Equip your purchases in your <a href="/profile/settings" class="text-link hover:underline"
							>profile settings</a
						>!
					</p>
				</div>
			</div>
		</div>
	</div>

	{#if product.weightStyles?.length}
		<section id="styles" class="mt-24 scroll-mt-24">
			<div class="mb-8 flex items-center gap-4">
				<div class="bg-border h-px flex-1"></div>
				<h2 class="text-3xl font-bold">Included Styles</h2>
				<div class="bg-border h-px flex-1"></div>
			</div>

			<div class="grid gap-8">
				{#each product.weightStyles.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0) as { id } (id)}
					{@const style = data.styles.find((s) => s.id === id)}
					{#if style}
						<div class="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
							<div class="bg-muted/30 border-b px-6 py-4">
								<div class="flex items-center justify-between">
									<div>
										<h3 class="text-xl font-bold">{style.name}</h3>
										<p class="text-muted-foreground font-mono text-sm">/weight style</p>
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
</div>

<Dialog.Root bind:open={claimModalOpen}>
	<Dialog.ScrollContent>
		<Dialog.Title>Unlock {product.name}</Dialog.Title>
		<div class="mt-4 flex flex-col gap-4">
			<p>You can claim this item for free!</p>

			<div class="bg-muted/50 rounded-lg p-4 text-sm">
				<p class="mb-1 font-semibold">Why two options?</p>
				<p class="text-muted-foreground">
					"Unlock on Discord" adds it to your Discord inventory (requires billing info). "Claim Item" adds it
					directly to your Elite account (no billing info needed).
				</p>
			</div>

			<div class="flex w-full flex-col gap-3 pt-2">
				<form action="?/claim" method="post" class="w-full" use:enhance>
					<input type="hidden" name="sku" value={product.id} />
					<Button type="submit" class="w-full font-semibold" variant="secondary" size="lg">
						Claim Directly
					</Button>
				</form>

				<div class="relative flex items-center py-2">
					<div class="border-border grow border-t"></div>
					<span class="text-muted-foreground mx-4 shrink-0 text-xs uppercase">Or</span>
					<div class="border-border grow border-t"></div>
				</div>

				<Button href="/shop/{product.id}/buy" class="w-full font-semibold" size="lg">
					{isFree ? 'Unlock' : 'Buy'} on Discord
					<ExternalLink size={16} class="ml-2" />
				</Button>
			</div>
		</div>
	</Dialog.ScrollContent>
</Dialog.Root>
