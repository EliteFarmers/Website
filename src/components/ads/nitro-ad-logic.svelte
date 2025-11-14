<script lang="ts">
	import { dev } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		slotId: string;
		config: Record<string, unknown>;
	}
	let { slotId, config, ...rest }: Props = $props();

	let wrapper = $state<HTMLDivElement | null>(null);

	let hasRequested = false;
	let retryTimeout: number | undefined;
	let adConfig = $derived(dev ? { ...config, demo: true } : config);

	function createContainer() {
		if (!wrapper) return;
		// eslint-disable-next-line svelte/no-dom-manipulating
		wrapper.innerHTML = '';

		const el = document.createElement('div');
		el.id = slotId;
		// eslint-disable-next-line svelte/no-dom-manipulating
		wrapper.appendChild(el);
	}

	function createAd(): boolean {
		if (!window.nitroAds || hasRequested) return true;

		try {
			window.nitroAds.createAd(slotId, adConfig);
			hasRequested = true;
			return true;
		} catch (e) {
			console.warn('Failed to create NitroAd:', e);
			return false;
		}
	}

	function retryCreateAd() {
		let attempt = 0;
		const max = 40;

		const run = () => {
			const ok = createAd();
			if (!ok && attempt < max) {
				attempt++;
				retryTimeout = window.setTimeout(run, Math.min(500, 100 + attempt * 50));
			}
		};

		run();
	}

	function removeAd() {
		if (!hasRequested) return;

		try {
			window.nitroAds?.removeAd?.(slotId);
		} catch {
			/* empty */
		}

		try {
			const el = document.getElementById(slotId);
			if (el) el.innerHTML = '';
		} catch {
			/* empty */
		}

		hasRequested = false;
	}

	onMount(() => {
		createContainer();
		retryCreateAd();
	});

	onDestroy(() => {
		if (retryTimeout) clearTimeout(retryTimeout);
		removeAd();
	});
</script>

<div bind:this={wrapper} {...rest}></div>
