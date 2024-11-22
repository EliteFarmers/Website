<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Alert from '$ui/alert';

	interface Props {
		api?: components['schemas']['ApiAccessDto'];
	}

	let { api = {} }: Props = $props();

	let entries = $derived(Object.entries(api));
</script>

{#if !api.collections}
	<div class="flex w-full justify-center">
		<Alert.Root class="items-centers flex w-full max-w-xl flex-col bg-destructive/80">
			<Alert.Title class="flex flex-wrap">
				{#each entries as [key, value] (key)}
					{#if !value}
						<p class="my-1 flex flex-1 basis-1/2 justify-center align-middle capitalize">
							<strong>{key} API&nbsp;</strong> - Disabled
						</p>
					{/if}
				{/each}
			</Alert.Title>
			<Alert.Description>
				<p class="text-center">Most data is missing due to the user's API settings.</p>
			</Alert.Description>
		</Alert.Root>
	</div>
{:else if entries.some(([, value]) => !value)}
	<div class="flex w-full justify-center">
		<Alert.Root class="items-centers flex w-full max-w-xl flex-col bg-yellow-100 dark:bg-yellow-600">
			<Alert.Title class="flex flex-wrap">
				{#each entries as [key, value] (key)}
					{#if !value}
						<p class="my-1 flex flex-1 basis-1/2 justify-center align-middle capitalize">
							<strong>{key} API&nbsp;</strong> - Disabled
						</p>
					{/if}
				{/each}
			</Alert.Title>
		</Alert.Root>
	</div>
{/if}
