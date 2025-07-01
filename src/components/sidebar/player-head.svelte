<script lang="ts" module>
	import User from '@lucide/svelte/icons/user';
</script>

<script lang="ts">
	interface Props {
		uuid?: string | null;
		size?: keyof typeof sizes;
	}

	let { uuid, size = 'sm' }: Props = $props();

	let errored = $state(false);
	let loading = $state(true);

	function onerror() {
		if (errored) return;
		errored = true;
	}

	async function onload() {
		loading = false;
	}

	const sizes = {
		sm: 'size-4 rounded-[0.12rem]',
		md: 'size-6 rounded-sm',
		lg: 'size-8 rounded-sm',
		xl: 'size-10 rounded-sm',
		'2xl': 'size-12 rounded-sm',
	};
</script>

{#if !errored && uuid}
	<div class="relative {sizes[size]}">
		{#if loading}
			<User class="aspect-square {sizes[size]} absolute top-0 left-0" />
		{/if}
		<img
			loading="lazy"
			src="https://api.elitebot.dev/account/{uuid}/face.png"
			alt={loading ? '' : 'Player Head'}
			{onload}
			{onerror}
			class="aspect-square {sizes[size]} pixelated absolute top-0 left-0"
		/>
	</div>
{:else}
	<User class="aspect-square {sizes[size]}" />
{/if}
