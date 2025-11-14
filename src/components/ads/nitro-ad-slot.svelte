<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { HTMLAttributes } from 'svelte/elements';
	import NitroAdLogic from './nitro-ad-logic.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		slotId: string;
		config: Record<string, unknown>;
	}

	let { ...rest }: Props = $props();

	let displayAds = $state(true);

	afterNavigate(() => {
		const hasAdFreeFlag = page.data.session?.flags.includes('AD_FREE');
		displayAds = hasAdFreeFlag ? false : !page.route.id?.includes('/(auth)');
	});
</script>

{#if displayAds}
	{#key page.route.id}
		<NitroAdLogic {...rest} />
	{/key}
{/if}
