<script lang="ts">
	export let gold = 0;
	export let silver = 0;
	export let bronze = 0;
</script>

<div class="flex flex-col md:flex-row gap-2 md:gap-4 justify-evenly w-full">
	<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
		<h1 class="text-2xl font-semibold text-yellow-500">
			{gold.toLocaleString()}
		</h1>
		<h2>Gold</h2>
	</div>
	<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
		<h1 class="text-2xl font-semibold text-stone-600 dark:text-zinc-300">
			{silver.toLocaleString()}
		</h1>
		<h2>Silver</h2>
	</div>
	<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
		<h1 class="text-2xl font-semibold text-orange-700">
			{bronze.toLocaleString()}
		</h1>
		<h2>Bronze</h2>
	</div>
</div>
