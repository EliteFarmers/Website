<script lang="ts">
	import NitroAdSlot from '$comp/ads/nitro-ad-slot.svelte';
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import { MOBILE_BREAKPOINT } from '$lib/hooks/is-mobile.svelte';
	import * as Sidebar from '$ui/sidebar';

	const sidebar = Sidebar.useSidebar();
	const adCtx = getAdCtx();
</script>

<div class="flex h-[250px] w-full justify-center overflow-clip">
	{#key sidebar.isMobile}
		<NitroAdSlot
			class="mt-8 block h-[250px] w-full"
			slotId="footer-bottom"
			config={{
				delayLoading: true,
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

{#if sidebar.isMobile}
	<NitroAdSlot
		createDiv={false}
		slotId="anchor-bottom"
		onCreated={(element) => {
			adCtx.bottomAnchor = element;
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
			mediaQuery: `(max-width: ${MOBILE_BREAKPOINT}px)`,
		}}
	/>
{/if}
