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
	<section class="flex flex-col gap-4 w-full max-w-2xl my-8">
		<h1 class="text-4xl mb-16">Products</h1>

		<div class="flex flex-col gap-4 w-full">
			{#each data.products as product}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-gray-100 dark:bg-zinc-800"
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
