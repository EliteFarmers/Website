<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import Settings from 'lucide-svelte/icons/settings';
	import Product from '$comp/monetization/product.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head title="Products" description="Manage products" />

<main class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Products</h1>

		<div class="flex w-full flex-col gap-4">
			{#each data.products as product}
				<div
					class="flex w-full flex-col items-center justify-between gap-2 rounded-md bg-gray-100 p-2 dark:bg-zinc-800 md:flex-row"
				>
					<Product {product} />
					<div class="flex flex-row gap-4 pr-2">
						<Button href="/admin/product/{product.id}">
							<Settings size={16} />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>
