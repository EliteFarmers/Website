<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
 
	let collapse = true;

</script>

<section class="mx-1 relative cursor-pointer" on:mouseleave={() => collapse = true} on:mouseenter={() => collapse = false}>
	<div class="p-3 bg-gray-200 rounded-lg">
		<slot name="top" />	
		{#if !collapse}
			<div transition:slide={{ duration: 500, easing: quadInOut }} class="absolute bg-gray-200 rounded-lg p-3 left-0">
				<slot name="rest" />
			</div>
		{/if}
	</div>
</section>