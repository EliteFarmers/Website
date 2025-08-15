import CopyPlus from '@lucide/svelte/icons/copy-plus';
import Fuel from '@lucide/svelte/icons/fuel';
import Gauge from '@lucide/svelte/icons/gauge';
import LeafyGreen from '@lucide/svelte/icons/leafy-green';
import Percent from '@lucide/svelte/icons/percent';
import { ComposterUpgrade } from 'farming-weight';
import type { Component } from 'svelte';

export const COMPOSTER_UPGRADE_TO_IMG: Record<ComposterUpgrade, Component> = {
	[ComposterUpgrade.Speed]: Gauge,
	[ComposterUpgrade.MultiDrop]: CopyPlus,
	[ComposterUpgrade.FuelCap]: Fuel,
	[ComposterUpgrade.OrganicMatterCap]: LeafyGreen,
	[ComposterUpgrade.CostReduction]: Percent,
};
