<script lang="ts">
	import type { APISettings } from '$lib/skyblock';

	export let api: APISettings;

	const entries = Object.entries(api);
	const anyOff = entries.some(([, value]) => !value.enabled);
</script>

{#if anyOff}
	<section class="flex justify-center align-middle py-8">
		<div class="border-4 rounded-lg border-red-600 w-[95%] lg:w-[80%] xl:w-[70%] bg-red-300 text-center p-3">
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
{/if}

<style lang="postcss">
	.apivalue {
		@apply flex justify-center align-middle capitalize;
	}
</style>
