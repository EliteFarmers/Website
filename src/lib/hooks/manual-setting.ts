import type { ManualSettingId } from 'farming-weight';
import { getContext, setContext } from 'svelte';

export interface ManualSettingContext {
	open: (setting: ManualSettingId) => void;
}

export function setManualSettingContext(context: ManualSettingContext) {
	setContext('manual-setting', context);
}

export function getManualSettingContext() {
	return getContext<ManualSettingContext | undefined>('manual-setting');
}
