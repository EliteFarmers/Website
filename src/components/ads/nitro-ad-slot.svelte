<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { HTMLAttributes } from 'svelte/elements';
	import NitroAdLogic from './nitro-ad-logic.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		slotId: string;
		createDiv?: boolean;
		config: Record<string, unknown>;
		onCreated?: (el: HTMLDivElement | null) => void;
		recreateOnRouteChange?: boolean;
		showWhenAuthenticated?: boolean;
		showWhenUnauthenticated?: boolean;
	}

	let {
		recreateOnRouteChange = true,
		showWhenAuthenticated = true,
		showWhenUnauthenticated = true,
		...rest
	}: Props = $props();

	let displayAds = $derived.by(() => {
		if (!browser) {
			return false;
		}
		const session = page.data.session;
		const isAdFree = session?.flags?.includes('AD_FREE') || session?.perms?.viewAdminPages;

		if (page.data.ads === false || isAdFree) {
			return false;
		}

		return session ? showWhenAuthenticated : showWhenUnauthenticated;
	});

	afterNavigate(() => {
		if (page.data.ads === false) {
			displayAds = false;
		}
	});
</script>

{#if displayAds}
	{#if recreateOnRouteChange}
		{#key page.route.id}
			<NitroAdLogic {...rest} />
		{/key}
	{:else}
		<NitroAdLogic {...rest} />
	{/if}
{/if}
