<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { getSprayonatorTierOptions } from '$lib/rates/sprayonator';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import { getSprayonatorTierInfo, Stat } from 'farming-weight';
	import type { PestFarmingPageContext } from './pest-farming-context.svelte';

	let { pest }: { pest: PestFarmingPageContext } = $props();

	const sprayonatorTierOptions = $derived(getSprayonatorTierOptions(pest.ctx.farmingInventory.current));
	const sprayonatorBonus = $derived(25 * getSprayonatorTierInfo(pest.sprayonatorTier).effectMultiplier);
</script>

<SettingListItem
	title="Sprayed Plot"
	description="If you're farming in a sprayed plot. Provides bonus pest chance."
	wiki="https://w.elitesb.gg/Sprayonator"
>
	<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
		<FortuneBreakdown
			breakdown={{ Sprayonator: { value: sprayonatorBonus, stat: Stat.BonusPestChance } }}
			enabled={pest.rates.pestFarming.sprayedPlot}
		/>
		<Switch
			checked={pest.rates.pestFarming.sprayedPlot}
			onCheckedChange={(checked) => pest.setSprayedPlot(checked)}
		/>
	</div>
</SettingListItem>
<SettingSeperator />

<SettingListItem title="Sprayer Tier" description="Juicy and Salty multiply the selected material's base effect.">
	<Select.Simple
		class="my-1 h-10 min-w-40"
		value={pest.rates.pestFarming.sprayonator}
		change={(value) => pest.setSprayonatorTier(value ?? 'auto')}
		options={sprayonatorTierOptions}
	/>
</SettingListItem>
