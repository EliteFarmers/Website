<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	export let hasItems = true;
	let collapse = true;
</script>

<section
	class="mx-1 relative cursor-pointer"
	on:mouseleave={() => (collapse = true)}
	on:mouseenter={() => (collapse = false)}
	on:click={() => (collapse = !collapse)}
>
	<div class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-lg">
		<slot name="top" />
		{#if !collapse && hasItems}
			<div
				transition:slide={{ duration: 500, easing: quadInOut }}
				class="absolute z-50 bg-gray-200 dark:bg-zinc-700 rounded-lg p-3 left-0"
			>
				<slot name="rest" />
			</div>
		{/if}
	</div>
</section>
