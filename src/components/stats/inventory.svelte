<script lang="ts">
	import { onMount } from "svelte";
	import Slot from "./slot.svelte";

	export let itemstacks: any[];

	onMount(() => {

	});
</script>

<section class="flex align-middle justify-center columns-9">
	{#each itemstacks as item}
		<Slot itemstack={item} />
	{/each}
</section>
