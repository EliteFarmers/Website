<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import NitroAdSlot from '$comp/ads/nitro-ad-slot.svelte';
	import { cn } from '$lib/utils';
	import { Separator } from '$ui/separator';
	import * as Sidebar from '$ui/sidebar';
	import Question from '@lucide/svelte/icons/circle-question-mark';
	import { MediaQuery } from 'svelte/reactivity';
	import { STORE_CODE } from '../../routes/(main)/gems/hypixel-store';
	import RailGroup from './rail-group.svelte';
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

	const siderailQuery = new MediaQuery('(width >= 80rem)');
	const shouldShowSiderail = $derived(siderailQuery.current ? sidebarState.open : false);
</script>

<aside class="flex h-full flex-col items-center justify-start" bind:this={asideElement}>
	<div
		class={cn(
			`flex flex-col items-center justify-start gap-2 md:flex-row md:flex-wrap md:items-start md:justify-center md:gap-6 @max-7xl:mt-8 ${sidebarState.open ? '@7xl:mt-64 @7xl:items-start @7xl:gap-2' : 'mt-8'}`,
			className
		)}
	>
		<div class="hidden w-full justify-end {sidebarState.open ? '@7xl:flex' : ''}">
			<Separator class="mb-3 max-w-1/2" />
		</div>

		<RailGroup>
			<p class="font-semibold">Support The Site</p>
			<RailItem img="/images/farm-rat.png" name="View the Shop!" href="/shop" imgClass="object-bottom" />
		</RailGroup>

		<Separator class="mt-4 mb-2 w-full max-w-48 md:hidden {sidebarState.open ? '@7xl:block' : ''}" />

		<RailGroup>
			<div class="flex items-center justify-center gap-1">
				<p class="font-semibold">Unlock Badges</p>
				<a href="/info/badges" class="-mb-0.5 inline-block"
					><Question class="text-muted-foreground size-4" />
				</a>
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
		</RailGroup>

		<Separator class="mt-4 mb-2 w-full max-w-48 md:hidden {sidebarState.open ? '@7xl:block' : ''}" />

		<RailGroup>
			<p class="font-semibold">Buy Gems</p>

			<RailItem
				img="/images/creatorcode.webp"
				name="Use code {STORE_CODE.code}"
				href="/gems"
				imgClass="object-top"
			>
				{#snippet absolute()}
					<div class="absolute top-[48%] left-[28%] text-sm font-semibold text-[#1ec64c]">
						{STORE_CODE.code}
					</div>
				{/snippet}
			</RailItem>
		</RailGroup>

		<div class="hidden w-full justify-end {sidebarState.open ? '@7xl:flex' : ''}">
			<Separator class="my-4 max-w-1/2" />
		</div>
	</div>

	{#key shouldShowSiderail}
		{#if shouldShowSiderail}
			<NitroAdSlot
				class="mt-1 mb-2 h-fit w-full"
				slotId="siderail-position"
				config={{
					delayLoading: true,
					report: {
						enabled: true,
						icon: true,
						wording: 'Report Ad',
						position: 'bottom-right',
					},
				}}
			/>
		{/if}
	{/key}
	<!-- {#if sidebarState.open}
		<div id="siderail-position" class="h-full w-full"></div>
		
	{/if} -->
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
