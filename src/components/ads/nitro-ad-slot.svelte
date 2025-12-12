<script lang="ts">
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
	}

	let { recreateOnRouteChange = true, ...rest }: Props = $props();

	let displayAds = $state(true);

	afterNavigate(() => {
		const hasAdFreeFlag = page.data.session?.flags.includes('AD_FREE');
		displayAds = hasAdFreeFlag ? false : !page.route.id?.includes('/(auth)');
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
