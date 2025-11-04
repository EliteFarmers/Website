<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { Separator } from '$ui/separator';
	import * as Sidebar from '$ui/sidebar';
	import Question from '@lucide/svelte/icons/circle-question-mark';
	import { STORE_CODE } from '../../routes/(main)/gems/hypixel-store';
	import RailItem from './rail-item.svelte';
	const sidebarState = Sidebar.useSidebar();

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let asideElement = $state<HTMLElement | null>(null);

	afterNavigate(() => {
		const hero = document.getElementById('hero-banner');
		if (asideElement && hero) {
			asideElement.classList.add('pt-16');
		} else if (asideElement) {
			asideElement.classList.remove('pt-16');
		}
	});
</script>

<aside
	class={cn(`flex flex-col items-center gap-2 ${sidebarState.open ? '@7xl:mt-64 @7xl:items-start' : ''}`, className)}
	bind:this={asideElement}
>
	<div class="hidden w-full justify-end {sidebarState.open ? '@7xl:flex' : ''}">
		<Separator class="mb-3 max-w-1/2" />
	</div>
	<p class="font-semibold">Support The Site</p>

	<RailItem img="/images/farm-rat.png" name="View the Shop!" href="/shop" imgClass="object-bottom"></RailItem>
	<Separator class="mt-4 mb-2 w-full max-w-48" />
	<div class="flex items-center justify-center gap-1">
		<p class="font-semibold">Unlock Badges</p>
		<a href="/info/badges" class="-mb-0.5 inline-block"><Question class="text-muted-foreground size-4" /> </a>
	</div>

	<RailItem img="/images/LuminiBanner.webp" name="Buy Stickers!" href="/stickers" target="_blank">
		{#snippet absolute()}
			<div class="absolute top-2 right-4 size-8 overflow-visible rounded-md">
				<div class="sticker-sprite relative size-full"></div>
			</div>
		{/snippet}
	</RailItem>
	<RailItem
		img="/images/kofi_logo.webp"
		name="Donate!"
		href="/donate"
		target="_blank"
		imgClass="object-contain p-2"
	/>

	<Separator class="mt-4 mb-2 w-full max-w-48" />
	<p class="font-semibold">Buy Gems</p>

	<RailItem img="/images/creatorcode.webp" name="Use code {STORE_CODE.code}" href="/gems" imgClass="object-top">
		{#snippet absolute()}
			<div class="absolute top-[45%] left-[28%] text-[1cqw] font-semibold text-[#1ec64c]">
				{STORE_CODE.code}
			</div>
		{/snippet}
	</RailItem>

	<div class="hidden w-full justify-end {sidebarState.open ? '@7xl:flex' : ''}">
		<Separator class="mt-4 max-w-1/2" />
	</div>
</aside>

<style lang="css">
	.sticker-sprite {
		background-image: url(/images/allstickers.webp);
		background-size: 1000% 100%;

		animation-name: sprite-sheet-animation;
		animation-duration: 20s;
		animation-timing-function: steps(10, end);
		animation-iteration-count: infinite;
		background-position: 0% 100%;
	}

	@keyframes sprite-sheet-animation {
		from {
			background-position: 0% 100%;
		}
		to {
			background-position: -1000% 100%;
		}
	}
</style>
