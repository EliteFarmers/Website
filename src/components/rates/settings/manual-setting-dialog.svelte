<script lang="ts">
	import { getRatesSettingsOpen } from '$lib/stores/ratesData';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import Settings from '@lucide/svelte/icons/settings';
	import type { ManualSettingId } from 'farming-weight';
	import type { Snippet } from 'svelte';
	import ManualSetting from './manual-setting.svelte';

	interface Props {
		setting: ManualSettingId | null;
		/** Renders the control for the open setting instead of the shared fortune settings */
		control?: Snippet<[ManualSettingId]>;
	}

	let { setting = $bindable(null), control }: Props = $props();

	const settingsOpen = getRatesSettingsOpen();

	function openAllSettings() {
		setting = null;
		$settingsOpen = true;
	}
</script>

<Dialog.Root
	open={setting !== null}
	onOpenChange={(open) => {
		if (!open) setting = null;
	}}
>
	<Dialog.ScrollContent parentClass="max-w-xl">
		<Dialog.Header>
			<Dialog.Title>Not in the Hypixel API</Dialog.Title>
			<Dialog.Description>This value can't be loaded from your profile, set it here.</Dialog.Description>
		</Dialog.Header>
		{#if setting}
			{#if control}
				{@render control(setting)}
			{:else}
				<ManualSetting {setting} />
			{/if}
		{/if}
		<Dialog.Footer>
			<Button variant="outline" onclick={openAllSettings}>
				<Settings size={16} />
				All settings
			</Button>
		</Dialog.Footer>
	</Dialog.ScrollContent>
</Dialog.Root>
