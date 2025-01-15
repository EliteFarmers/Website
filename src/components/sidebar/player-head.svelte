<script lang="ts" module>
	import User from 'lucide-svelte/icons/user';
</script>

<script lang="ts">
	interface Props {
		uuid?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { uuid, size = 'sm' }: Props = $props();

	let errored = $state(false);
	let loading = $state(true);

	function onerror() {
		if (errored) return;
		errored = true;
	}

	function onload() {
		loading = false;
	}

	const sizes = {
		sm: 'size-4 rounded-[0.12rem]',
		md: 'size-6 rounded-sm',
		lg: 'size-8 rounded-sm',
	};
</script>

{#if !errored && uuid}
	{#if loading}
		<User class="aspect-square {sizes[size]}" />
	{/if}
	<img
		loading="lazy"
		src="https://mc-heads.net/avatar/{uuid}"
		alt={loading ? '' : 'Player Head'}
		{onload}
		{onerror}
		class="aspect-square {sizes[size]} pixelated"
	/>
{:else}
	<User class="aspect-square {sizes[size]}" />
{/if}
