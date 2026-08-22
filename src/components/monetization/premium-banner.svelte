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
		'relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border bg-card p-8 shadow-xl md:flex-row md:items-center md:justify-between',
		className
	)}
>
	<div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
	<div class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>

	<div class="relative z-10 flex flex-col gap-6">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2 text-primary">
				<Star class="h-5 w-5 fill-current" />
				<span class="font-bold tracking-wider uppercase">Premium Membership</span>
			</div>
			<h2 class="text-4xl font-extrabold text-foreground md:text-5xl">{product.name}</h2>
		</div>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Check class="h-4 w-4" />
				</div>
				<span class="text-foreground">Support the project</span>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Check class="h-4 w-4" />
				</div>
				<span class="text-foreground">Exclusive Profile Badge</span>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Check class="h-4 w-4" />
				</div>
				<div class="flex items-center gap-2 text-foreground">
					<span>Custom Emoji </span>
					<span class="rounded bg-muted px-1 py-0.5 font-mono text-sm">
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
			<div class="text-3xl font-bold text-foreground">${dollars}</div>
			<div class="text-sm text-muted-foreground">per month</div>
		</div>
		<a
			href="/shop/{product.id}"
			class="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90"
		>
			Subscribe Now
		</a>
	</div>
</div>
