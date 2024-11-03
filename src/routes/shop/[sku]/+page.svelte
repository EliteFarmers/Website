<script lang="ts">
	import Head from '$comp/head.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import type { PageData } from './$types';
	import ProductPrice from '$comp/monetization/product-price.svelte';
	import * as Card from '$ui/card';
	import * as Carousel from '$ui/carousel';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Image from 'lucide-svelte/icons/image';
	import Palette from 'lucide-svelte/icons/palette';
	import Tag from 'lucide-svelte/icons/tag';
	import TicketX from 'lucide-svelte/icons/ticket-x';
	import Replace from 'lucide-svelte/icons/replace';
	import ScrollText from 'lucide-svelte/icons/scroll-text';
	import { Button } from '$comp/ui/button';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import ProductUnlock from '$comp/monetization/product-unlock.svelte';
	import Badge from '$comp/stats/badge.svelte';

	export let data: PageData;

	$: product = data.product;
	$: badge = data.badges.find((b) => b.id === product.features?.badgeId);
</script>

<Head title="Shop" description="Help support development with cosmetics!" />

<main class="flex flex-col justify-center md:justify-start gap-12 my-16 mx-2 w-full">
	<section class="flex flex-col items-start gap-4">
		<div class="flex flex-row items-center gap-4 -mb-3">
			<h1 class="text-4xl">{product.name}</h1>
			<ProductPrice {product} />
		</div>
		<a class="text-primary/60 hover:text-primary flex flex-row items-center gap-1" href="/shop">
			<ArrowLeft size={16} class="inline-block mt-1" />
			Back to Shop
		</a>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
			{#if product.description}
				<p class="max-w-2xl">
					{product.description}
				</p>
			{:else}
				<p class="max-w-2xl">No description available.</p>
			{/if}

			<div class="flex flex-col justify-end">
				<h2 class="text-xl font-semibold">Unlocks Features</h2>
			</div>
			<div>
				<Carousel.Root class="w-full max-w-96 mx-10">
					<Carousel.Content>
						{#each product.images ?? [] as image, i (i)}
							<Carousel.Item>
								<div class="">
									<Card.Root>
										<Card.Content
											class="flex aspect-square items-center justify-center p-0 relative overflow-hidden"
										>
											<img
												src={image.url}
												alt={product.name}
												title={image.title}
												class="w-full object-cover"
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
			<div class="flex flex-col gap-2 w-full">
				{#if product.weightStyles?.length}
					<ProductUnlock open={true}>
						<svelte:fragment slot="header">
							<Image />
							<p class="font-semibold">Weight Styles</p>
						</svelte:fragment>
						<p class="max-w-sm">
							Unlock the weight <a href="#styles" class="underline">
								style{product.weightStyles.length > 1 ? 's' : ''} shown below!</a
							> These replace the normal weight image when anyone uses the /weight bot command on your account.
						</p>
					</ProductUnlock>
				{/if}
				{#if product.features?.embedColors?.length}
					<ProductUnlock open={true}>
						<svelte:fragment slot="header">
							<Palette />
							<p class="font-semibold">Embed Colors</p>
						</svelte:fragment>
						<div class="flex flex-wrap items-center gap-2">
							{#each product?.features.embedColors as color}
								<div
									class="flex flex-row gap-1 items-center rounded-sm p-1"
									style="background-color: #{color}"
								>
									<span class="text-sm leading-none font-semibold text-black">#{color}</span>
								</div>
							{/each}
						</div>
					</ProductUnlock>
				{/if}
				{#if badge}
					<ProductUnlock open={true}>
						<svelte:fragment slot="header">
							<Tag />
							<p class="font-semibold">Grants A Badge</p>
						</svelte:fragment>
						<div>
							<Badge {badge} />
						</div>
					</ProductUnlock>
				{/if}
				{#if product.features?.hideShopPromotions}
					<ProductUnlock>
						<svelte:fragment slot="header">
							<TicketX />
							<p class="font-semibold">Hide Shop Promotions</p>
						</svelte:fragment>
						<p class="max-w-sm">
							This allows you to hide any promotions for the Elite Shop in bot commands.
						</p>
					</ProductUnlock>
				{/if}
				{#if product.features?.weightStyleOverride}
					<ProductUnlock>
						<svelte:fragment slot="header">
							<Replace />
							<p class="font-semibold">Use Weight Style On Everyone</p>
						</svelte:fragment>
						<p class="max-w-sm">
							With this enabled your selected weight style will show up for everyone you look up using the
							bot.
						</p>
					</ProductUnlock>
				{/if}
				{#if product.features?.moreInfoDefault}
					<ProductUnlock>
						<svelte:fragment slot="header">
							<ScrollText />
							<p class="font-semibold">Default "More Info"</p>
						</svelte:fragment>
						<p class="max-w-sm">
							Using the /weight command on the bot will show the "More Info" section by default.
						</p>
					</ProductUnlock>
				{/if}
				<div class="flex flex-row justify-end w-full">
					<div class="flex flex-row items-center gap-2 -mb-3">
						<ProductPrice {product} />
						<Button href="/shop/{product.id}/buy" class=" m-1 bg-blue-700 font-semibold text-white">
							Buy on Discord
							<ExternalLink size={16} class="ml-1.5" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</section>

	{#if product.weightStyles?.length}
		<section id="styles" class="scroll-mt-32">
			<h2 class="text-2xl">Weight Styles</h2>
			<p class="py-4">
				Preview the weight styles that will be unlocked when you purchase this product on Discord!
			</p>
			<div class="flex flex-col gap-4">
				{#each product.weightStyles as { id } (id)}
					{@const style = data.styles.find((s) => s.id === id)}
					{#if style?.styleFormatter === 'data'}
						<div class="origin-top-left object-scale-down">
							<WeightStyle {style} account={data.account} weight={data.weight} />
						</div>
					{/if}
				{/each}
			</div>
		</section>
	{/if}
</main>
