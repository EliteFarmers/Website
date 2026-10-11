import type { ManualSettingId } from 'farming-weight';
import { getContext, setContext } from 'svelte';

export interface OpenManualSetting {
	id: ManualSettingId;
	/** Whether it's open because the value isn't available in the Hypixel API */
	notInApi: boolean;
}

export interface ManualSettingContext {
	open: (setting: OpenManualSetting) => void;
}

export function setManualSettingContext(context: ManualSettingContext) {
	setContext('manual-setting', context);
}

export function getManualSettingContext() {
	return getContext<ManualSettingContext | undefined>('manual-setting');
}
