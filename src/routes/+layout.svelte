<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import UmamiAnalytics from '$comp/analytics/umami.svelte';
	import GiftNotificationDialog from '$comp/gift-notification-dialog.svelte';
	import PageToast from '$comp/page-toast.svelte';
	import ThemeWatcher from '$comp/theme-watcher.svelte';
	import { initAdContext } from '$lib/hooks/ads.svelte';
	import { getGlobalContext, initGlobalContext } from '$lib/hooks/global.svelte';
	import { IsHover } from '$lib/hooks/is-hover.svelte';
	import { initPageContext } from '$lib/hooks/page.svelte';
	import { initFavoritesContext } from '$lib/stores/favorites.svelte';
	import { initRatesData } from '$lib/stores/ratesData';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initThemeContext } from '$lib/stores/themes.svelte';
	import { setContext, untrack } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	interface Props {
		children?: import('svelte').Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();

	let isHover = $state(new IsHover());
	setContext('isHover', isHover);

	initGlobalContext(
		(() => ({
			session: data.session,
			announcements: data.cache?.announcements ?? [],
			texturePacks: data.cache?.texturepacks ?? [],
			previewPack: data.previewPack,
			clearPreviewPackId: data.clearPreviewPackId,
		}))()
	);
	initThemeContext();
	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
	initFavoritesContext();
	initPageContext();
	initAdContext();

	const gbl = getGlobalContext();

	$effect.pre(() => {
		const newData = {
			session: data.session,
			announcements: data.cache?.announcements ?? [],
			texturePacks: data.cache?.texturepacks ?? [],
			previewPack: data.previewPack,
			clearPreviewPackId: data.clearPreviewPackId,
		};
		untrack(() => gbl.setValues(newData));
	});

	$effect(() => {
		if (!data.previewPack && !data.clearPreviewPackId) return;

		const previewUrl = new URL(window.location.href);
		previewUrl.searchParams.delete('previewPack');
		previewUrl.searchParams.delete('clearPreviewPack');
		window.history.replaceState(
			window.history.state,
			'',
			`${previewUrl.pathname}${previewUrl.search}${previewUrl.hash}`
		);
	});

	// Force hard navigation if the website was updated
	beforeNavigate(({ to, willUnload }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});
</script>

{@render children?.()}

<PageToast />
<GiftNotificationDialog />
<ThemeWatcher />
<UmamiAnalytics />
