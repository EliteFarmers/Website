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

	function onerror() {
		if (errored) return;
		errored = true;
	}

	const sizes = {
		sm: 'size-4 rounded-[0.12rem]',
		md: 'size-6 rounded-sm',
		lg: 'size-8 rounded-sm',
	};
</script>

{#if !errored && uuid}
	<img
		src="https://mc-heads.net/avatar/{uuid}"
		alt="Player Head"
		{onerror}
		class="aspect-square {sizes[size]} pixelated"
	/>
{:else}
	<User class="aspect-square {sizes[size]}" />
{/if}
