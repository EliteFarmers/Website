<script lang="ts" module>
	import { cn } from '$lib/utils';
	import User from '@lucide/svelte/icons/user';
</script>

<script lang="ts">
	interface Props {
		uuid?: string | null;
		size?: keyof typeof sizes;
		class?: string;
	}

	let { uuid, size = 'sm', class: customClass }: Props = $props();

	let errored = $state(false);
	let loading = $state(true);

	function onerror() {
		if (errored) return;
		errored = true;
	}

	async function onload() {
		loading = false;
	}

	const sizes: Record<string, string> = {
		sm: 'size-4 rounded-[0.12rem]',
		md: 'size-6 rounded-sm',
		lg: 'size-8 rounded-sm',
		xl: 'size-10 rounded-sm',
		'2xl': 'size-12 rounded-sm',
	};
</script>

{#if !errored && uuid}
	<div class={cn(`relative ${sizes[size]} aspect-square`, customClass)}>
		{#if loading}
			<User class={cn(`absolute ${sizes[size]} top-0 left-0 aspect-square`, customClass)} />
		{/if}
		<img
			loading="lazy"
			src="https://api.elitebot.dev/account/{uuid}/face.png"
			alt={loading ? '' : 'Player Head'}
			{onload}
			{onerror}
			class={cn(`absolute ${sizes[size]} pixelated top-0 left-0 aspect-square`, customClass)}
		/>
	</div>
{:else}
	<User class={cn(`aspect-square ${sizes[size]}`, customClass)} />
{/if}
