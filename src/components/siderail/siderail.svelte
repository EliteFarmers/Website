<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import StickySideRail from '$comp/ads/sticky-side-rail.svelte';
	import { IsInViewport } from 'runed';
	import { tick } from 'svelte';

	let spacerElement = $state<HTMLElement | null>(null);
	let asideElement = $state<HTMLElement | null>(null);

	afterNavigate(() => {
		tick().then(() => {
			const hero = document.getElementById('hero-banner');
			if (spacerElement && hero) {
				spacerElement.classList.add('h-30');
			} else if (spacerElement) {
				spacerElement.classList.remove('h-30');
			}
		});
	});

	const isVisible = new IsInViewport(() => asideElement);
</script>

<aside class="mt-32 flex h-full flex-col items-center justify-start" bind:this={asideElement}>
	<div bind:this={spacerElement}></div>
	{#if isVisible.current}
		<StickySideRail
			class="sticky top-20 mt-1 mb-2 h-fit w-full"
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
</aside>
