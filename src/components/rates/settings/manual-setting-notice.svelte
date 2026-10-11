<script lang="ts">
	import { getManualSettingContext } from '$lib/hooks/manual-setting';
	import * as Popover from '$ui/popover';
	import Settings from '@lucide/svelte/icons/settings';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { ManualSettingId } from 'farming-weight';

	interface Props {
		setting?: ManualSettingId;
		/** `false` when the source isn't available in the Hypixel API */
		api?: boolean;
		size?: number;
	}

	let { setting, api, size = 16 }: Props = $props();

	const manualSettings = getManualSettingContext();
	const notInApi = $derived(api === false);
</script>

{#if setting && manualSettings}
	<button
		type="button"
		class="cursor-pointer rounded-sm hover:opacity-70"
		title={notInApi ? 'Not available in the Hypixel API, click to set it' : 'Open the settings for this'}
		onclick={(event) => {
			event.stopPropagation();
			manualSettings.open({ id: setting, notInApi });
		}}
	>
		<Settings {size} class="text-completed" />
		<span class="sr-only">
			{notInApi ? "Set this value, it isn't available in the Hypixel API" : 'Open the settings for this'}
		</span>
	</button>
{:else if notInApi}
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
