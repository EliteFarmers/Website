<script lang="ts">
	import { page } from '$app/state';
	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import type { ShopCategoryDto } from '$lib/api';
	import { getTebex } from '$lib/tebex/index.svelte';
	import { Button } from '$ui/button';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
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
			<a href="/shop" class="group flex items-center gap-3" data-sveltekit-preload-data="tap">
				<div
					class="from-primary/20 to-primary/5 border-border/60 flex size-11 items-center justify-center rounded-2xl border bg-linear-to-br shadow-sm"
				>
					<img src="/favicon.webp" alt="Elite Shop" class="size-7 rounded-md" />
				</div>
				<div class="leading-tight">
					<p class="text-xs font-semibold">Elite</p>
					<p class="text-lg font-black">Shop</p>
				</div>
			</a>

			<div class="ml-auto flex items-center gap-2">
				<Button variant="ghost" class="hidden sm:inline-flex" href="/">
					Back to Elite
					<ChevronRight class="size-4" />
				</Button>

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
						Checkout
					</Button>
				{/if}

				<ModeToggle />
				<ShopAccountMenu />
			</div>
		</div>

		<nav class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
			<a
				href="/shop"
				class:bg-primary={activePath === '/shop'}
				class:text-primary-foreground={activePath === '/shop'}
				class:bg-card={activePath !== '/shop'}
				class:text-foreground={activePath !== '/shop'}
				class="border-border/60 hover:bg-card inline-flex rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
				data-sveltekit-preload-data="tap"
			>
				All Collections
			</a>

			{#each shopCategories as category (category.id)}
				{@const categoryHref = `/shop/category/${category.slug}`}
				<a
					href={categoryHref}
					class:bg-primary={activePath === categoryHref}
					class:text-primary-foreground={activePath === categoryHref}
					class:bg-card={activePath !== categoryHref}
					class:text-foreground={activePath !== categoryHref}
					class="border-border/60 hover:bg-card inline-flex rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
					data-sveltekit-preload-data="tap"
				>
					{category.title}
				</a>
			{/each}
		</nav>
	</div>
</header>
