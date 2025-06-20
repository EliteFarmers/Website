<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import * as Command from '$ui/command';
	import Settings from '@lucide/svelte/icons/settings';
	import Product from '$comp/monetization/product.svelte';
	import type { PageData } from './$types';
	import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { enhance } from '$app/forms';
	import { ScrollArea } from '$ui/scroll-area';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head title="Products" description="Manage products" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Product Management</h1>

		<div class="flex flex-row items-center gap-2">
			<Button
				target="_blank"
				href="https://discord.com/developers/applications/{PUBLIC_DISCORD_CLIENT_ID}/skus"
				class="flex w-fit flex-row gap-2"
			>
				New Product
				<ExternalLink size={16} />
			</Button>
			<form action="?/refresh" method="post" use:enhance>
				<Button class="w-fit" type="submit" variant="secondary">Refresh Products</Button>
			</form>
		</div>

		<div class="flex w-full flex-col gap-2">
			<Command.Root>
				<Command.Input placeholder="Filter products..." class="h-9" />
				<Command.Empty>No products found.</Command.Empty>
				<ScrollArea orientation="vertical" class="h-96 overflow-auto">
					<Command.Group itemsClass="flex flex-wrap gap-3">
						{#each data.products as product (product.id)}
							<Command.Item value={product.name ?? ''} class="rounded-md p-0 hover:rounded-md">
								<Product
									{product}
									showPublished={true}
									showFeatures={false}
									class="m-0 md:min-w-120"
								>
									<Button href="/shop/{product.id}" class="m-1" variant="ghost" size="sm">
										<ExternalLink />
									</Button>
									<Button href="/admin/product/{product.id}" size="sm">
										<Settings size={16} />
									</Button>
								</Product>
							</Command.Item>
						{/each}
					</Command.Group>
				</ScrollArea>
			</Command.Root>
		</div>
	</section>
</div>
