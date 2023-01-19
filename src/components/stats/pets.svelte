<script lang="ts">
	import type { PetList } from "$lib/skyblock";

	export let pets: PetList;
	const farming = [
		'ELEPHANT', 'CHICKEN', 'PIG', 'BEE', 'MOOSHROOM_COW', 'RABBIT'
	]

	const farmingPets = pets.filter(pet => pet.type === "Farming");
</script>

<section class="py-4">
	{#each pets as pet (pet)}
		<p>{pet.type}</p>
	{/each}
</section>
