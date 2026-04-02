<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import Product from '$comp/monetization/product.svelte';
	import { env } from '$env/dynamic/public';
	import { getTebexThemeConfig } from '$lib/tebex/theme';
	import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '$ui/accordion';
	import { Button } from '$ui/button';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import type Tebex from '@tebexio/tebex.js';
	import { onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import PaymentsList from './components/payments-list.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let refreshing = $state(false);
	let tebexModule = $state<typeof Tebex | null>(null);
	let openingPortal = $state(false);

	let products = $derived(
		Object.values(
			Object.groupBy(
				(data.entitlements ?? []).filter((e) => e.product),
				(e) => e.product?.id
			)
		).map((group) => group?.[0]?.product) ?? []
	);

	onMount(async () => {
		try {
			const tebex = await import('@tebexio/tebex.js');
			tebexModule = tebex.default ?? tebex;
		} catch {
			console.error('Failed to load Tebex.js');
		}
	});

	async function openSubscriptionPortal() {
		const token = env.PUBLIC_TEBEX_PROJECT_TOKEN;
		if (!token || !tebexModule) return;

		openingPortal = true;
		try {
			const { theme, colors } = getTebexThemeConfig();

			tebexModule.portal.init({ token, theme, colors });
			tebexModule.portal.launch();
		} finally {
			openingPortal = false;
		}
	}
</script>

<Head title="Payments" description="Review your Elite purchases, gifts, and checkout history." />

<div class="my-16 flex w-full flex-col gap-6">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold">Payments</h1>
		<p class="text-muted-foreground max-w-3xl">
			Track everything you have purchased through Elite, including gifts and recurring checkouts.
		</p>
	</div>

	{#if env.PUBLIC_TEBEX_PROJECT_TOKEN}
		<Button
			variant="outline"
			class="w-fit"
			onclick={openSubscriptionPortal}
			disabled={!tebexModule || openingPortal}
		>
			<CreditCard class="size-4" />
			Manage Subscriptions
		</Button>
	{/if}

	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold">Active Products</h2>
			<form
				action="?/refreshPurchases"
				method="post"
				use:enhance={() => {
					refreshing = true;
					return async ({ result }) => {
						await new Promise((r) => setTimeout(r, 500));
						refreshing = false;
						await invalidateAll();
						await applyAction(result);
					};
				}}
			>
				<Button type="submit" disabled={refreshing} variant="outline" size="sm">
					{#if refreshing}
						<LoaderCircle class="animate-spin" />
					{:else}
						<RefreshCw class="size-4" />
					{/if}
					Refresh
				</Button>
			</form>
		</div>

		{#if form?.error}
			<p class="text-destructive text-sm">{form.error}</p>
		{/if}

		{#if products.length > 0}
			<Accordion type="single">
				<AccordionItem value="active-products" class="border-none">
					<AccordionTrigger class="py-0 text-sm font-medium">
						Show Products ({products.length})
					</AccordionTrigger>
					<AccordionContent>
						<div class="grid grid-flow-row-dense grid-cols-1 gap-2 pt-4 md:grid-cols-2">
							{#each products as product (product?.id)}
								{#if product}
									<Product {product} />
								{/if}
							{/each}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		{:else}
			<p class="text-muted-foreground text-sm">
				No active products. Visit the <Button href="/shop" variant="link" class="h-auto p-0">Shop</Button> to get
				started!
			</p>
		{/if}
	</section>

	<PaymentsList
		initialOrders={data.initialOrders}
		initialError={data.initialError}
		initialPageIndex={data.initialPageIndex}
		initialPageSize={data.initialPageSize}
	/>
</div>
