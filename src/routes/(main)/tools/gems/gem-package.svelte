<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import type { Snippet } from 'svelte';
	import type { GemPackage } from './hypixel-store';

	interface Props {
		gemPackage: GemPackage;
		cookieValue: number;
		button?: Snippet<[string]>;
	}

	let { gemPackage, cookieValue = $bindable(0), button }: Props = $props();

	const gbl = getGlobalContext();

	let total = $derived(gemPackage.gems.base + (gemPackage.gems.bonus ?? 0));
	let { base, bonus } = $derived(gemPackage.gems);

	let url = $derived(gbl.session?.ign ? gemPackage.url + '?ign=' + gbl.session?.ign : gemPackage.url);
</script>

<div
	class="group flex flex-col gap-2 rounded-md border bg-card p-4 shadow-accent-green/60 transition-shadow hover:border-accent-green hover:shadow-md md:basis-64"
>
	<div class="flex h-full w-full items-center justify-between gap-4 md:flex-col">
		<div class="flex flex-col justify-center gap-1 font-semibold text-accent-green md:items-center">
			<div class="flex w-full flex-1 flex-col text-2xl md:my-8 md:items-center md:text-5xl">
				<p>{total.toLocaleString()}</p>
			</div>
			<p class="md:text-lg">SkyBlock Gems</p>
			{#if bonus}
				<p class="text-xs text-muted-foreground md:text-sm">
					{base.toLocaleString()} gems + {bonus.toLocaleString()} bonus gems
				</p>
			{/if}
		</div>

		{@render cost()}
	</div>
	<div class="contents md:hidden">
		{@render packageWorth()}
	</div>
</div>

{#snippet cost()}
	<div
		class="mt-2 flex flex-col items-end justify-center gap-4 pt-2 md:w-full md:items-center md:justify-between md:border-t-2"
	>
		<div class="hidden md:contents">
			{@render packageWorth()}
		</div>
		<div
			class="flex flex-col items-end justify-center gap-2 md:w-full md:flex-row md:items-center md:justify-between"
		>
			<p class="text-xl leading-none font-semibold">{gemPackage.cost} USD</p>
			{@render button?.(url)}
		</div>
	</div>
{/snippet}

{#snippet packageWorth()}
	{@const cookiesWorth = total / 325}

	<div class="flex flex-row gap-1">
		<ItemRender skyblockId="BOOSTER_COOKIE" class="size-10" />
		<div class="flex items-center gap-1 md:flex-col">
			<span class="self-center text-sm text-muted-foreground"
				>Worth {cookiesWorth.toFixed(1)} booster cookies
				{#if cookieValue}
					<span class="text-sm text-muted-foreground">
						or ~<span class="text-completed">{Math.round(cookiesWorth * cookieValue).toLocaleString()}</span
						> coins
					</span>
				{/if}
			</span>
		</div>
	</div>
{/snippet}
