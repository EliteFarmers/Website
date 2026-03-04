<script lang="ts">
	import type { ProductDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import Star from '@lucide/svelte/icons/star';
	import { onMount } from 'svelte';

	interface Props {
		product: ProductDto;
		class?: string;
	}

	let { product, class: className = '' }: Props = $props();

	let dollars = $derived(((product.price ?? 0) / 100).toFixed(2));
	const gbl = getGlobalContext();

	const emojis = ['👑', '💎', '🌟', '🔥', '🚀', '⚡'];
	let currentEmojiIndex = $state(0);

	onMount(() => {
		const interval = setInterval(() => {
			currentEmojiIndex = (currentEmojiIndex + 1) % emojis.length;
		}, 2000);
		return () => clearInterval(interval);
	});
</script>

<div
	class={cn(
		'bg-card relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border p-8 shadow-xl md:flex-row md:items-center md:justify-between',
		className
	)}
>
	<div class="bg-primary/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"></div>
	<div class="bg-primary/5 absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl"></div>

	<div class="relative z-10 flex flex-col gap-6">
		<div class="flex flex-col gap-2">
			<div class="text-primary flex items-center gap-2">
				<Star class="h-5 w-5 fill-current" />
				<span class="font-bold tracking-wider uppercase">Premium Membership</span>
			</div>
			<h2 class="text-foreground text-4xl font-extrabold md:text-5xl">{product.name}</h2>
		</div>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
					<Check class="h-4 w-4" />
				</div>
				<span class="text-foreground">Support the project</span>
			</div>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
					<Check class="h-4 w-4" />
				</div>
				<span class="text-foreground">Exclusive Profile Badge</span>
			</div>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
					<Check class="h-4 w-4" />
				</div>
				<div class="text-foreground flex items-center gap-2">
					<span>Custom Emoji </span>
					<span class="bg-muted rounded px-1 py-0.5 font-mono text-sm">
						{gbl.session?.ign ?? 'Username'}
						{#key currentEmojiIndex}
							<span class="inline-block transition-all duration-300">
								{emojis[currentEmojiIndex]}
							</span>
						{/key}
					</span>
				</div>
			</div>
		</div>
	</div>

	<div class="relative z-10 mt-8 flex flex-col items-center gap-4 md:mt-0 md:items-end">
		<div class="text-center md:text-right">
			<div class="text-foreground text-3xl font-bold">${dollars}</div>
			<div class="text-muted-foreground text-sm">per month</div>
		</div>
		<a
			href="/shop/{product.id}"
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 font-bold transition-transform hover:scale-105"
		>
			Subscribe Now
		</a>
	</div>
</div>
