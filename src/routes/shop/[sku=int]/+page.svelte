<script lang="ts">
	import Head from '$comp/head.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import type { PageData } from './$types';
	import ProductPrice from '$comp/monetization/product-price.svelte';
	import * as Card from '$ui/card';
	import * as Carousel from '$ui/carousel';
	import * as Popover from '$ui/popover';
	import { Button } from '$ui/button';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Image from 'lucide-svelte/icons/image';
	import Palette from 'lucide-svelte/icons/palette';
	import Tag from 'lucide-svelte/icons/tag';
	import TicketX from 'lucide-svelte/icons/ticket-x';
	import Replace from 'lucide-svelte/icons/replace';
	import ScrollText from 'lucide-svelte/icons/scroll-text';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import ProductUnlock from '$comp/monetization/product-unlock.svelte';
	import Badge from '$comp/stats/badge.svelte';
	import Package from 'lucide-svelte/icons/package';
	import Info from 'lucide-svelte/icons/info';
	import { type Crumb, getBreadcrumb } from '$lib/hooks/breadcrumb.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let product = $derived(data.product);
	let badge = $derived(data.badges.find((b) => b.id === product.features?.badgeId));
	let isFree = $derived(!product.price || product.price === 0);

	const crumbs = $derived<Crumb[]>([{ name: 'Shop', href: '/shop' }, { name: product.name }]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});
</script>

<Head title="Shop" description="Help support development with cosmetics!" />

<div class="my-16 flex w-full flex-col items-center gap-12 px-2">
	<section class="flex flex-col items-start gap-4">
		<div class="-mb-3 flex flex-row items-center gap-4">
			<h1 class="text-4xl">{product.name}</h1>
			<ProductPrice {product} />
		</div>
		<a class="flex flex-row items-center gap-1 text-muted-foreground hover:text-primary" href="/shop">
			<ArrowLeft size={16} class="mt-1 inline-block" />
			Back to Shop
		</a>

		<div class="mt-8 flex w-full max-w-4xl flex-col items-center gap-8 lg:grid lg:grid-cols-2 lg:items-start">
			{#if product.description}
				<p class="order-1 max-w-2xl">
					{product.description}
				</p>
			{:else}
				<!-- Maintain grid layout -->
				<div class="order-1"></div>
			{/if}

			<div class="order-3 flex h-full flex-col justify-end lg:order-2">
				<h2 class="text-xl font-semibold">Unlocks Features</h2>
			</div>
			<div class="order-2 w-full max-w-96 lg:order-3">
				{#if product.images?.length}
					<div class="w-full px-10">
						<Carousel.Root>
							<Carousel.Content>
								{#each product.images ?? [] as image, i (i)}
									<Carousel.Item>
										<div class="w-full">
											<Card.Root>
												<Card.Content
													class="relative flex aspect-square items-center justify-center overflow-hidden p-0"
												>
													<img
														src={image.url}
														alt={product.name}
														title={image.title}
														class="object-fit w-full"
													/>
												</Card.Content>
											</Card.Root>
										</div>
									</Carousel.Item>
								{/each}
							</Carousel.Content>
							<Carousel.Previous />
							<Carousel.Next />
						</Carousel.Root>
					</div>
				{:else}
					<Card.Root>
						<Card.Content
							class="relative flex aspect-square items-center justify-center overflow-hidden p-0"
						>
							<div class="grid min-h-32 w-full items-center justify-center rounded-md drop-shadow-lg">
								<Package size={64} />
							</div>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
			<div class="order-4 flex w-full max-w-96 flex-col gap-2">
				{#if product.weightStyles?.length}
					<ProductUnlock open={true}>
						{#snippet header()}
							<Image />
							<p class="font-semibold">Weight Styles</p>
						{/snippet}
						<p class="max-w-sm">
							Unlock the weight <a href="#styles" class="underline">
								style{product.weightStyles.length > 1 ? 's' : ''} shown below!</a
							> These replace the normal weight image when anyone uses the /weight bot command on your account.
						</p>
					</ProductUnlock>
				{/if}
				{#if product.features?.embedColors?.length}
					<ProductUnlock open={true}>
						{#snippet header()}
							<Palette />
							<p class="font-semibold">Embed Colors</p>
						{/snippet}
						<div class="flex flex-wrap items-center gap-2">
							{#each product?.features.embedColors as color}
								<div
									class="flex flex-row items-center gap-1 rounded-sm p-1"
									style="background-color: #{color}"
								>
									<span class="text-sm font-semibold leading-none text-black">#{color}</span>
								</div>
							{/each}
						</div>
					</ProductUnlock>
				{/if}
				{#if badge}
					<ProductUnlock open={true}>
						{#snippet header()}
							<Tag />
							<p class="font-semibold">Grants A Badge</p>
						{/snippet}
						<div>
							<Badge {badge} />
						</div>
					</ProductUnlock>
				{/if}
				{#if product.features?.hideShopPromotions}
					<ProductUnlock>
						{#snippet header()}
							<TicketX />
							<p class="font-semibold">Hide Shop Promotions</p>
						{/snippet}
						<p class="max-w-sm">
							This allows you to hide any promotions for the Elite Shop in bot commands.
						</p>
					</ProductUnlock>
				{/if}
				{#if product.features?.weightStyleOverride}
					<ProductUnlock>
						{#snippet header()}
							<Replace />
							<p class="font-semibold">Use Weight Style On Everyone</p>
						{/snippet}
						<p class="max-w-sm">
							With this enabled your selected weight style will show up for everyone you look up using the
							bot.
						</p>
					</ProductUnlock>
				{/if}
				{#if product.features?.moreInfoDefault}
					<ProductUnlock>
						{#snippet header()}
							<ScrollText />
							<p class="font-semibold">Default "More Info"</p>
						{/snippet}
						<p class="max-w-sm">
							Using the /weight command on the bot will show the "More Info" section by default.
						</p>
					</ProductUnlock>
				{/if}
				<div class="flex w-full flex-col items-end gap-1">
					<div class="flex flex-row items-center gap-2">
						<ProductPrice {product} />
						<Button href="/shop/{product.id}/buy" class="bg-link font-semibold text-white hover:bg-link/85">
							{isFree ? 'Unlock' : 'Buy'} on Discord
							<ExternalLink size={16} class="ml-1.5" />
						</Button>
					</div>
					{#if isFree}
						<Popover.Mobile>
							{#snippet trigger()}
								<div class="flex flex-row items-center gap-1 text-muted-foreground">
									<p>Free Item</p>
									<Info size={16} class="mt-0.5" />
								</div>
							{/snippet}
							<p class="max-w-64 text-sm">
								Although this is a free item, Discord still requires you to fill out billing
								information. You won't be charged, and Discord doesn't share this information with us.
							</p>
						</Popover.Mobile>
					{/if}
				</div>
			</div>
		</div>
	</section>

	{#if product.weightStyles?.length}
		<section id="styles" class="scroll-mt-32">
			<h2 class="text-2xl">Weight Styles</h2>
			<p class="py-4">
				Preview the <strong>{product.weightStyles.length.toLocaleString()}</strong> weight style{product
					.weightStyles.length === 1
					? ''
					: 's'} that will be unlocked when you {isFree ? 'unlock' : 'purchase'} this product on Discord!
			</p>
			<div class="flex flex-col gap-4">
				{#each product.weightStyles.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0) as { id } (id)}
					{@const style = data.styles.find((s) => s.id === id)}
					{#if style}
						<Card.Root class="max-w-3xl">
							<Card.Content class="p-2">
								<p class="mb-1 text-lg font-semibold">{style.name}</p>
								{#if style?.styleFormatter === 'data'}
									<div class="origin-top-left object-scale-down">
										<WeightStyle
											{style}
											ign={data.ign ?? ''}
											uuid={data.uuid ?? ''}
											weight={data.weight}
										/>
									</div>
								{:else}
									<p>
										{style.description}
									</p>
									<p class="text-sm text-muted-foreground">Preview not available for this style.</p>
								{/if}
							</Card.Content>
						</Card.Root>
					{/if}
				{/each}
			</div>
		</section>
	{/if}
</div>
