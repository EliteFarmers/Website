<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import SettingBigSeperator from '$comp/settings/setting-big-seperator.svelte';
	import SettingHeader from '$comp/settings/setting-header.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import type { PestFarmingRateSettings } from '$lib/stores/ratesData';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import { Stat, TEMPORARY_FORTUNE } from 'farming-weight';
	import type { PestFarmingPageContext } from './pest-farming-context.svelte';

	interface Props {
		pest: PestFarmingPageContext;
	}

	let { pest }: Props = $props();

	const repellentOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'normal', label: 'Pest Repellent' },
		{ value: 'max', label: 'Pest Repellent MAX' },
	] satisfies { value: PestFarmingRateSettings['pestRepellent']; label: string }[];
</script>

<div class="relative w-full max-w-2xl flex-1 flex-col justify-center rounded-md p-0 sm:p-4">
	<SettingHeader class="mt-0 text-2xl">Pest Farming Settings</SettingHeader>
	<p class="text-muted-foreground px-1 text-sm">Buffs that increase Bonus Pest Chance for spawning more pests.</p>
	<SettingBigSeperator />

	<SettingListItem
		title="Sprayed Plot"
		description="If you're farming in a sprayed plot. Provides bonus pest chance."
		wiki="https://w.elitesb.gg/Sprayonator"
	>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown
				breakdown={{ Sprayonator: { value: 50, stat: Stat.BonusPestChance } }}
				enabled={pest.rates.pestFarming.sprayedPlot}
			/>
			<Switch
				checked={pest.rates.pestFarming.sprayedPlot}
				onCheckedChange={(checked) => pest.setSprayedPlot(checked)}
			/>
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title={TEMPORARY_FORTUNE.stinkyCheesePotion.name}
		description="Bonus pest chance potion."
		wiki={TEMPORARY_FORTUNE.stinkyCheesePotion.wiki}
	>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown
				breakdown={{
					[TEMPORARY_FORTUNE.stinkyCheesePotion.name]: { value: 20, stat: Stat.BonusPestChance },
				}}
				enabled={pest.rates.useTemp && pest.rates.temp.stinkyCheesePotion}
			/>
			<Switch
				checked={pest.rates.useTemp && pest.rates.temp.stinkyCheesePotion}
				onCheckedChange={(checked) => pest.setStinkyCheesePotion(checked)}
			/>
		</div>
	</SettingListItem>
	<SettingBigSeperator />

	<SettingHeader class="mt-8 text-xl">Cycle Timing</SettingHeader>
	<p class="text-muted-foreground px-1 text-sm">
		Tune the farming, swapping, spawning, and vacuuming assumptions used for coins per hour.
	</p>
	<SettingBigSeperator />

	<SettingListItem
		title="Farm Blocks Per Second"
		description="Average crop blocks broken during the normal farm phase."
	>
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.blocksPerSecond}
			onValueChange={(value) => pest.setPestRateSetting('blocksPerSecond', value ?? 0)}
			min={0}
			max={80}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title="Spawn Blocks Per Second"
		description="Average crop blocks broken after swapping to spawn gear."
	>
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.spawnBlocksPerSecond}
			onValueChange={(value) => pest.setPestRateSetting('spawnBlocksPerSecond', value ?? 0)}
			min={0}
			max={80}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title="Pre-Cooldown Spawn Gear"
		description="Seconds before the pest cooldown ends when you swap into Bonus Pest Chance gear."
	>
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.farmSwapBeforeCooldownSeconds}
			onValueChange={(value) => pest.setPestRateSetting('farmSwapBeforeCooldownSeconds', value ?? 0)}
			min={0}
			max={120}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Farm To Spawn Swap" description="Seconds lost swapping from farm gear into spawn gear.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.farmToSpawnSwapSeconds}
			onValueChange={(value) => pest.setPestRateSetting('farmToSpawnSwapSeconds', value ?? 0)}
			min={0}
			max={60}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Spawn To Kill Swap" description="Seconds lost swapping from spawn gear into kill gear.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.spawnToKillSwapSeconds}
			onValueChange={(value) => pest.setPestRateSetting('spawnToKillSwapSeconds', value ?? 0)}
			min={0}
			max={60}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Kill Setup Time" description="Fixed seconds before you start vacuuming pests.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.fixedKillSetupSeconds}
			onValueChange={(value) => pest.setPestRateSetting('fixedKillSetupSeconds', value ?? 0)}
			min={0}
			max={120}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Pest Search Time" description="Fixed seconds spent locating pests before vacuuming them.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.fixedPestSearchSeconds}
			onValueChange={(value) => pest.setPestRateSetting('fixedPestSearchSeconds', value ?? 0)}
			min={0}
			max={300}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Seconds Per Pest" description="Average seconds to vacuum each spawned pest.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.secondsPerPestKill}
			onValueChange={(value) => pest.setPestRateSetting('secondsPerPestKill', value ?? 0)}
			min={0}
			max={60}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Return To Farm" description="Seconds lost returning to the normal farming route.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.returnToFarmSeconds}
			onValueChange={(value) => pest.setPestRateSetting('returnToFarmSeconds', value ?? 0)}
			min={0}
			max={120}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title="Active Pests At Start"
		description="Pests already alive when the modeled cycle begins, reducing available spawn slots."
	>
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.activePestsAtCycleStart}
			onValueChange={(value) => pest.setPestRateSetting('activePestsAtCycleStart', value ?? 0)}
			min={0}
			max={8}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Max Active Pests" description="Maximum pests that can be alive on your Garden.">
		<NumberInput
			class="my-1 h-10 max-w-32"
			value={pest.pestRateSettings.maxActivePests}
			onValueChange={(value) => pest.setPestRateSetting('maxActivePests', value ?? 1)}
			min={1}
			max={8}
		/>
	</SettingListItem>
	<SettingBigSeperator />

	<SettingHeader class="mt-8 text-xl">Cycle Modifiers</SettingHeader>
	<SettingBigSeperator />

	<SettingListItem
		title="Atmospheric Filter Autumn"
		description="Applies the Autumn atmospheric filter spawn multiplier."
		wiki="https://w.elitesb.gg/Atmospheric_Filter"
	>
		<Switch
			checked={pest.pestRateSettings.atmosphericFilterAutumn}
			onCheckedChange={(checked) => pest.setPestRateSetting('atmosphericFilterAutumn', checked)}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Finnegan Active" description="Applies Finnegan's pest cooldown reduction assumptions.">
		<Switch
			checked={pest.pestRateSettings.finneganActive}
			onCheckedChange={(checked) => pest.setPestRateSetting('finneganActive', checked)}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Pest Repellent" description="Extends pest spawn cooldown for repellent-based cycles.">
		<Select.Simple
			class="my-1 h-10 min-w-40"
			value={pest.pestRateSettings.pestRepellent}
			change={(value) => pest.setPestRateSetting('pestRepellent', value ?? 'none')}
			options={repellentOptions}
		/>
	</SettingListItem>
	<SettingBigSeperator />
</div>
