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
		sm: 'size-4',
		md: 'size-6',
		lg: 'size-8',
	};
</script>

{#if !errored && uuid}
	<img
		src="https://mc-heads.net/avatar/{uuid}"
		alt="Player Head"
		{onerror}
		class="aspect-square rounded-sm {sizes[size]}"
	/>
{:else}
	<User class="aspect-square rounded-sm {sizes[size]}" />
{/if}
