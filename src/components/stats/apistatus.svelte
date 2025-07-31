<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Alert from '$ui/alert';

	const ctx = getStatsContext();

	const api = $derived(ctx.member.api ?? {});
	const entries = $derived(Object.entries(api));
</script>

{#if !api.collections}
	<div class="flex w-full justify-center">
		<Alert.Root class="items-centers bg-destructive/80 flex w-full max-w-xl flex-col">
			<Alert.Title class="flex flex-wrap">
				{#each entries as [key, value] (key)}
					{#if !value}
						<p class="my-1 flex flex-1 basis-64 justify-center align-middle capitalize">
							<strong>{key} API&nbsp;</strong> - Disabled
						</p>
					{/if}
				{/each}
			</Alert.Title>
			<Alert.Description class="w-full">
				<p class="text-primary w-full text-center">Most data is missing due to the user's API settings.</p>
			</Alert.Description>
		</Alert.Root>
	</div>
{:else if entries.some(([, value]) => !value)}
	<div class="flex w-full justify-center">
		<Alert.Root class="items-centers bg-completed flex w-full max-w-xl flex-col">
			<Alert.Title class="flex w-full flex-wrap">
				{#each entries as [key, value] (key)}
					{#if !value}
						<p class="my-1 flex flex-1 basis-64 justify-center align-middle capitalize">
							<strong>{key} API&nbsp;</strong> - Disabled
						</p>
					{/if}
				{/each}
			</Alert.Title>
		</Alert.Root>
	</div>
{/if}
