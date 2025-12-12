<script lang="ts">
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from '$ui/sidebar/constants';
	import { watch } from 'runed';
	import { onMount } from 'svelte';
	import NitroAdSlot from './nitro-ad-slot.svelte';

	const sidebar = Sidebar.useSidebar();
	const adCtx = getAdCtx();
	let ref = $state<HTMLDivElement | null>(null);

	watch([() => sidebar.open, () => sidebar.isMobile, () => adCtx.floatingVideoLeftMargin], () => {
		updatePosition();
	});

	function updatePosition() {
		ref ??= document.getElementById('floating-video') as HTMLDivElement;
		if (!ref) return;

		if (sidebar.isMobile) {
			ref.style.marginLeft = adCtx.floatingVideoLeftMargin + 'rem';
			ref.style.marginBottom = adCtx.bottomAnchorSize.height + 'px';
			ref.classList.add('mobile');
			return;
		}

		ref.classList.remove('mobile');
		ref.style.marginBottom = '0px';
		ref.style.marginLeft = sidebar.open
			? `calc(${SIDEBAR_WIDTH} + ${adCtx.floatingVideoLeftMargin}rem)`
			: `calc(${SIDEBAR_WIDTH_ICON} + ${adCtx.floatingVideoLeftMargin}rem)`;
	}

	// Make sure that we move the add off of the sidebar, without this it can sometimes
	// fail to position correctly on initial load.
	onMount(() => {
		const timeouts = [
			setTimeout(() => {
				updatePosition();
			}, 2000),
			setTimeout(() => {
				updatePosition();
			}, 5000),
		];
		return () => timeouts.forEach(clearTimeout);
	});
</script>

<NitroAdSlot
	slotId="floating-video"
	createDiv={false}
	onCreated={(el) => {
		ref = el;
		updatePosition();
	}}
	recreateOnRouteChange={false}
	config={{
		format: 'floating',
		position: 'bottom-left',
	}}
/>
