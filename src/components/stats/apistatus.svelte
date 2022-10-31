<script lang="ts">
	import type { APISettings } from '$lib/skyblock';

	export let api: APISettings;

	const entries = Object.entries(api);
	const collectionOff = api?.collections?.enabled === false;
	const anyOff = entries.some(([, value]) => !value.enabled);
</script>

{#if collectionOff}
	<section class="flex justify-center align-middle py-8">
		<div
			class="border-4 rounded-lg border-red-400 w-[95%] lg:w-[80%] xl:w-[70%] bg-red-300 dark:border-red-800 dark:bg-red-900 text-center p-3"
		>
			<div class="flex flex-col md:flex-row gap-2 md:gap-6 justify-center align-middle whitespace-nowrap">
				{#each entries as [key, value]}
					{#if !value.enabled}
						<h1 class="apivalue">
							<strong>{key} API&nbsp;</strong> - Disabled
						</h1>
					{/if}
				{/each}
			</div>
		</div>
	</section>
{:else if anyOff}
	<section
		class="absolute flex justify-left align-middle pl-[2vw] sm:pl-[4vw] md:pl-[6vw] pb-4 -mt-8 sm:-mt-12 md:-mt-8"
	>
		<div
			class="border-4 border-t-0 rounded-lg rounded-t-none pt-1 border-yellow-300 bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-700 text-center p-1"
		>
			<div class="flex flex-col md:flex-row gap-4 md:gap-6 justify-center align-middle whitespace-nowrap">
				{#each entries as [key, value]}
					{#if !value.enabled}
						<h1 class="apivalue text-sm">
							<strong>{key} API&nbsp;</strong> - Disabled
						</h1>
					{/if}
				{/each}
			</div>
		</div>
	</section>
{/if}

<style lang="postcss">
	.apivalue {
		@apply flex justify-center align-middle capitalize;
	}
</style>
