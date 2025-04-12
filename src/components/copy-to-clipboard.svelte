<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { Button, type ButtonProps } from '$ui/button';

	let copyPromise: Promise<void> | null = $state(null);

	function copyClicked() {
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
		iconClass?: string;
		copy?: () => void;
	}

	let {
		text = '',
		size = undefined,
		class: className = undefined,
		iconClass = '',
		children,
		copy = $bindable(copyClicked),
		...rest
	}: Props = $props();

	let iconSize = $state(20);

	$effect(() => {
		if (size === 'sm') iconSize = 16;
		if (size === 'lg') iconSize = 24;
	});
</script>

<Button variant="ghost" onclick={copyClicked} {size} class={className} {...rest}>
	{#if copyPromise}
		{#await copyPromise}
			<LoaderCircle class="animate-spin {iconClass}" size={iconSize} />
		{:then}
			<Check size={iconSize} class={iconClass} />
		{:catch}
			<Copy size={iconSize} class={iconClass} />
		{/await}
	{:else}
		<Copy size={iconSize} class={iconClass} />
	{/if}
	{@render children?.()}
</Button>
