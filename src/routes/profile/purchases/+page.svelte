<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import Product from '$comp/monetization/product.svelte';
	import { Button } from '$ui/button';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	let loading = false;

	$: user = data.user || undefined;
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<main class="flex flex-col lg:flex-row justify-center gap-16 my-16 mx-2 justify-items-center">
	<section class="flex flex-col max-w-3xl w-full mx-4">
		<h1 class="text-2xl mb-4">Purchases</h1>
		{#if data.user.entitlements?.length === 0}
			<p class="mb-2">
				You don't manage any shop purchases! Check out the <a href="/shop" class="text-blue-400 hover:underline"
					>Discord Shop!</a
				>
			</p>
		{:else}
			<p class="mb-2">
				Check out the <a href="/shop" class="text-blue-400 hover:underline">Discord Shop!</a>
			</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense">
			{#each data.user.entitlements ?? [] as purchase (purchase.id)}
				<Product product={purchase.product} />
			{/each}
		</div>
		<form
			action="?/refreshPurchases"
			method="post"
			class="mt-2 mb-16"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					// Wait for a bit so the user can see the loading state
					await new Promise((r) => setTimeout(r, 500));
					loading = false;
					await invalidateAll();
					await applyAction(result);
				};
			}}
		>
			<Button type="submit" disabled={loading} variant="secondary">Refresh Purchases</Button>
		</form>
	</section>
</main>
