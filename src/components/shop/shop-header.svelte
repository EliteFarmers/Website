<script lang="ts">
	import { page } from '$app/state';
	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import type { ShopCategoryDto } from '$lib/api';
	import { getTebex } from '$lib/tebex/index.svelte';
	import { Button } from '$ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import ShopAccountMenu from './shop-account-menu.svelte';

	interface Props {
		categories: ShopCategoryDto[];
	}

	let { categories }: Props = $props();

	const tebex = getTebex();

	const activePath = $derived(page.url.pathname);
	const shopCategories = $derived.by(() => categories.filter((category) => category.products?.length));
	const checkoutItemCount = $derived.by(
		() => tebex.currentCheckout?.checkoutRequest.items.reduce((total, item) => total + item.quantity, 0) ?? 0
	);
	const checkoutTotal = $derived.by(() => {
		const totalPrice = tebex.currentCheckout?.totalPrice;
		if (!totalPrice) {
			return null;
		}

		return `$${totalPrice.toFixed(2)}`;
	});
</script>

<header class="border-border/60 bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
	<div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
		<div class="flex flex-wrap items-center gap-3">
			<div class="group flex items-center gap-3" data-sveltekit-preload-data="tap">
				<a href="/shop" class="group flex items-center gap-3">
					<div
						class="from-primary/20 to-primary/5 border-border/60 flex size-11 items-center justify-center rounded-2xl border bg-linear-to-br shadow-sm"
					>
						<img src="/favicon.webp" alt="Elite Shop" class="size-7 rounded-md" />
					</div>
					<div class="leading-tight">
						<p class="text-xs font-semibold">Elite Skyblock</p>
						<p class="text-lg font-black">Shop</p>
					</div>
				</a>
				<Button variant="ghost" class="text-muted-foreground hidden sm:inline-flex" href="/">
					<ChevronLeft class="size-3" />
					Back to Elite
				</Button>
			</div>

			<div class="ml-auto flex items-center gap-2">
				<ModeToggle />

				{#if checkoutItemCount > 0}
					<Button variant="outline" class="rounded-full px-4" href="/shop/checkout">
						<ShoppingBag />
						<span>{checkoutItemCount} {checkoutItemCount === 1 ? 'item' : 'items'}</span>
						{#if checkoutTotal}
							<span class="text-muted-foreground hidden text-xs sm:inline">{checkoutTotal}</span>
						{/if}
					</Button>
				{:else}
					<Button variant="outline" class="rounded-full px-4" href="/shop/checkout">
						<ShoppingBag />
						<span class=" hidden text-xs sm:inline">Checkout</span>
					</Button>
				{/if}

				<ShopAccountMenu />
			</div>
		</div>

		<nav class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
			<Button
				href="/shop"
				variant={activePath === '/shop' ? 'default' : 'outline'}
				class="border-border/60 inline-flex rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
				data-sveltekit-preload-data="tap"
			>
				All Collections
			</Button>

			{#each shopCategories as category (category.id)}
				{@const categoryHref = `/shop/category/${category.slug}`}
				<Button
					href={categoryHref}
					variant={activePath === categoryHref ? 'default' : 'outline'}
					class="border-border/60 inline-flex rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
					data-sveltekit-preload-data="tap"
				>
					{category.title}
				</Button>
			{/each}
		</nav>
	</div>
</header>
