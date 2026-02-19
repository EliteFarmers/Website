<script lang="ts">
	import NitroAdSlot from '$comp/ads/nitro-ad-slot.svelte';
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { onMount } from 'svelte';

	const sidebar = Sidebar.useSidebar();
	const adCtx = getAdCtx();

	let bottomAnchor = $state<HTMLElement | null>(null);
	onMount(() => {
		const timeouts = [
			setTimeout(() => {
				adCtx.bottomAnchor = bottomAnchor ?? document.getElementById('anchor-bottom');
			}, 2000),
			setTimeout(() => {
				adCtx.bottomAnchor = bottomAnchor ?? document.getElementById('anchor-bottom');
			}, 5000),
		];
		return () => timeouts.forEach(clearTimeout);
	});
</script>

<div class="flex h-70 w-full justify-center overflow-clip">
	{#key sidebar.isMobile}
		<NitroAdSlot
			class="mt-8 block h-fit w-full"
			slotId="footer-bottom"
			onCreated={(element) => {
				adCtx.footerBottom = element;
			}}
			config={{
				sizes: [
					['728', '90'],
					['970', '90'],
					['970', '250'],
					['300', '250'],
					['336', '280'],
					['320', '50'],
					['320', '100'],
				],
				report: {
					enabled: true,
					icon: true,
					wording: 'Report Ad',
					position: 'top-right-side',
				},
			}}
		/>
	{/key}
</div>

<NitroAdSlot
	createDiv={false}
	slotId="anchor-bottom"
	onCreated={(element) => {
		adCtx.bottomAnchor = element;
		bottomAnchor = element;
	}}
	config={{
		format: 'anchor-v2',
		anchor: 'bottom',
		anchorBgColor: 'rgb(0 0 0 / 80%)',
		anchorClose: true,
		anchorPersistClose: false,
		anchorStickyOffset: 0,
		report: {
			enabled: true,
			icon: true,
			wording: 'Report Ad',
			position: 'top-right-side',
		},
	}}
/>
