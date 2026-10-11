<script lang="ts">
	import { getManualSettingContext } from '$lib/hooks/manual-setting';
	import * as Popover from '$ui/popover';
	import Settings from '@lucide/svelte/icons/settings';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { ManualSettingId } from 'farming-weight';

	let { setting, size = 16 }: { setting?: ManualSettingId; size?: number } = $props();

	const manualSettings = getManualSettingContext();
</script>

{#if setting && manualSettings}
	<button
		type="button"
		class="cursor-pointer rounded-sm hover:opacity-70"
		title="Not available in the Hypixel API, click to set it"
		onclick={(event) => {
			event.stopPropagation();
			manualSettings.open(setting);
		}}
	>
		<Settings {size} class="text-completed" />
		<span class="sr-only">Set this value, it isn't available in the Hypixel API</span>
	</button>
{:else}
	<Popover.Mobile>
		{#snippet trigger()}
			<TriangleAlert {size} class="text-completed" />
		{/snippet}
		<p class="max-w-sm text-sm">
			This fortune source is not available in the Hypixel API. Configure settings on this page to mark it as
			complete.
		</p>
	</Popover.Mobile>
{/if}
