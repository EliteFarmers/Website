<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import { SprayonatorTier, Stat } from 'farming-weight';
	import type { PestFarmingPageContext } from './pest-farming-context.svelte';

	let { pest }: { pest: PestFarmingPageContext } = $props();

	const sprayonatorTierOptions = [
		{ value: SprayonatorTier.Regular, label: 'Sprayonator' },
		{ value: SprayonatorTier.Juicy, label: 'Juicy Sprayonator' },
		{ value: SprayonatorTier.Salty, label: 'Salty Sprayonator' },
	];
	const sprayonatorBonus = $derived(
		25 *
			(pest.rates.pestFarming.sprayonatorTier === SprayonatorTier.Salty
				? 3
				: pest.rates.pestFarming.sprayonatorTier === SprayonatorTier.Juicy
					? 2
					: 1)
	);
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
		value={pest.rates.pestFarming.sprayonatorTier}
		change={(value) => pest.setSprayonatorTier(value ?? SprayonatorTier.Regular)}
		options={sprayonatorTierOptions}
	/>
</SettingListItem>
