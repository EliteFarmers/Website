<script lang="ts">
	import Slot from './slot.svelte';

	export let itemstacks: any[];
</script>

<section class="flex align-middle justify-center columns-9">
	{#each itemstacks as item}
		<Slot itemstack={item} />
	{/each}
</section>
