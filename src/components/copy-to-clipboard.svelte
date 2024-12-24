<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { Button, type ButtonProps } from '$ui/button';

	let copyPromise: Promise<void> | null = $state(null);

	function copy() {
		copyPromise = navigator.clipboard
			.writeText(text)
			.then((x) => new Promise((resolve) => setTimeout(() => resolve(x), 100)));

		setTimeout(() => {
			copyPromise = null;
		}, 3000);
	}

	interface Props extends ButtonProps {
		text?: string;
		size?: 'default' | 'sm' | 'lg' | 'icon' | undefined;
		class?: string | undefined | null;
	}

	let { text = '', size = undefined, class: className = undefined, ...rest }: Props = $props();

	let iconSize = $state(20);

	$effect(() => {
		if (size === 'sm') iconSize = 16;
		if (size === 'lg') iconSize = 24;
	});
</script>

<Button variant="link" onclick={copy} {size} class={className} {...rest}>
	{#if copyPromise}
		{#await copyPromise}
			<LoaderCircle class="animate-spin" size={iconSize} />
		{:then}
			<Check size={iconSize} />
		{:catch}
			<Copy size={iconSize} />
		{/await}
	{:else}
		<Copy size={iconSize} />
	{/if}
</Button>
