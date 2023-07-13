<script lang="ts">
	export let gold = 0;
	export let silver = 0;
	export let bronze = 0;
	export let participations = 0;
</script>

<div class="flex flex-col md:flex-row gap-2 md:gap-4 justify-evenly w-full">
	{#if participations}
		<div class="flex items-baseline flex-1 justify-center gap-2 rounded-md p-2 md:px-4 bg-gray-200 dark:bg-zinc-800">
			<h1 class="text-2xl font-semibold text-red-700">
				{participations.toLocaleString()}
			</h1>
			<h2>Contest{participations > 1 ? 's' : ''}</h2>
		</div>
	{/if}
	<div class="flex items-baseline flex-1 justify-center gap-2 rounded-md p-2 md:px-4 bg-gray-200 dark:bg-zinc-800">
		<h1 class="text-2xl font-semibold text-yellow-500">
			{gold.toLocaleString()}
		</h1>
		<h2>Gold</h2>
	</div>
	<div class="flex items-baseline flex-1 justify-center gap-2 rounded-md p-2 md:px-4 bg-gray-200 dark:bg-zinc-800">
		<h1 class="text-2xl font-semibold text-stone-600 dark:text-zinc-300">
			{silver.toLocaleString()}
		</h1>
		<h2>Silver</h2>
	</div>
	<div class="flex items-baseline flex-1 justify-center gap-2 rounded-md p-2 md:px-4 bg-gray-200 dark:bg-zinc-800">
		<h1 class="text-2xl font-semibold text-orange-700">
			{bronze.toLocaleString()}
		</h1>
		<h2>Bronze</h2>
	</div>
</div>
