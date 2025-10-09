<script lang="ts">
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import type { GemPackage } from './hypixel-store';

	interface Props {
		gemPackage: GemPackage;
	}

	let { gemPackage }: Props = $props();

	const gbl = getGlobalContext();

	let total = $derived(gemPackage.gems.base + (gemPackage.gems.bonus ?? 0));
	let { base, bonus } = $derived(gemPackage.gems);

	let url = $derived(gbl.session?.ign ? gemPackage.url + '?ign=' + gbl.session?.ign : gemPackage.url);
</script>

<div
	class="bg-card group shadow-accent-green/60 hover:border-accent-green flex basis-64 flex-col rounded-md border p-4 transition-shadow hover:scale-[104%] hover:shadow-md"
>
	<div class="flex h-full w-full flex-col items-center justify-between gap-4 group-hover:scale-[calc(1/1.04))]">
		<div class="text-accent-green flex flex-col items-center gap-1 font-semibold">
			<div class="my-8 flex flex-col items-center text-5xl">
				<p>{total.toLocaleString()}</p>
			</div>
			<p class="text-lg">SkyBlock Gems</p>
			{#if bonus}
				<p class="text-muted-foreground text-sm">
					{base.toLocaleString()} gems + {bonus.toLocaleString()} bonus gems
				</p>
			{/if}
		</div>

		{@render cost()}
	</div>
</div>

{#snippet cost()}
	<div class="mt-2 flex w-full flex-row items-center justify-between border-t-2 pt-4">
		<p class="text-xl leading-none font-semibold">{gemPackage.cost} USD</p>
		<Button href={url} target="_blank"><ShoppingCart /> Buy Now</Button>
	</div>
{/snippet}
