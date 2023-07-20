<script lang="ts">
	import type { ItemStack } from '$lib/skyblock';
	import { onMount } from 'svelte';

	export let itemstack: ItemStack;

	$: id = 0;

	onMount(() => {
		console.log(itemstack);

		id = itemstack.id.value;
	});
</script>

<div class="relative rounded-lg w-20 h-20 m-2 bg-gray-200">
	<div
		class="absolute block rounded-md w-15 h-15 m-2 bg-gray-300"
		style="background-image: url(/itematlas.png); background-position: {id}px {id}px;"
	/>
</div>
