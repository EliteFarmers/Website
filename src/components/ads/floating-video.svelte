<script lang="ts">
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from '$ui/sidebar/constants';
	import { watch } from 'runed';
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

		if (adCtx.bottomAnchorSize.height) {
			ref.style.marginBottom = adCtx.bottomAnchorSize.height + 'px';
		} else {
			ref.style.marginBottom = '0px';
		}

		if (sidebar.isMobile) {
			ref.style.marginLeft = adCtx.floatingVideoLeftMargin + 'rem';

			ref.classList.add('mobile');
			return;
		}

		ref.classList.remove('mobile');
		ref.style.marginLeft = sidebar.open
			? `calc(${SIDEBAR_WIDTH} + ${adCtx.floatingVideoLeftMargin}rem)`
			: `calc(${SIDEBAR_WIDTH_ICON} + ${adCtx.floatingVideoLeftMargin}rem)`;
	}

	watch([() => adCtx.bottomAnchorSize.height, () => sidebar.open, () => sidebar.isMobile], () => {
		updatePosition();
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
