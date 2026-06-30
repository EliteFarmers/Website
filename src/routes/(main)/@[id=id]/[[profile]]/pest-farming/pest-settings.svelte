<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import SettingBigSeperator from '$comp/settings/setting-big-seperator.svelte';
	import SettingHeader from '$comp/settings/setting-header.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import type { PestFarmingRateSettings, PestFarmingTimeOfDay } from '$lib/stores/ratesData';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import {
		GARDEN_BESTIARY_NAMES,
		NATURAL_PESTS,
		Pest,
		Spray,
		SPRAY_NAMES,
		Stat,
		TEMPORARY_FORTUNE,
		type TemporaryFarmingFortune,
	} from 'farming-weight';
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

	const timeOfDayOptions = [
		{ value: 'day', label: 'Day' },
		{ value: 'night', label: 'Night' },
	] satisfies { value: PestFarmingTimeOfDay; label: string }[];

	const pestName = (pestId: Pest) => GARDEN_BESTIARY_NAMES[`pest_${pestId}_1`] ?? pestId;
	const pestOptions = NATURAL_PESTS.map((pestId) => ({ value: pestId, label: pestName(pestId) }));
	const sprayName = (sprayId: Spray) => SPRAY_NAMES[`spray_${sprayId}_1`] ?? sprayId;
	const sprayOptions = Object.values(Spray).map((sprayId) => ({ value: sprayId, label: sprayName(sprayId) }));
	type TemporaryFortuneToggleKey = Exclude<keyof TemporaryFarmingFortune, 'pestTurnIn'>;
	const pestTurnInTitle = `${TEMPORARY_FORTUNE.pestTurnIn.name} (40 Pests)`;
	const temporaryFortuneSources = [
		{ key: 'harvestPotion', total: 50 },
		{ key: 'magic8Ball', total: 25 },
		{ key: 'springFilter', total: 25 },
		{ key: 'anitaContest', total: 25 },
		{ key: 'chocolateTruffle', total: 30 },
		{ key: 'celestialMasonJar', total: 15 },
		{ key: 'melonJuiceMixin', total: 15 },
		{ key: 'finnsFocaccia', total: 5, stat: Stat.Overbloom },
	] satisfies { key: TemporaryFortuneToggleKey; total: number; stat?: Stat }[];

	function isTemporaryFortuneEnabled(key: TemporaryFortuneToggleKey) {
		return pest.rates.useTemp && Boolean(pest.rates.temp[key]);
	}
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
	<SettingBigSeperator />

	<SettingHeader class="mt-8 font-normal">
		<span class="text-xl font-semibold">Temporary Fortune</span>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown
				total={pest.tempFortune}
				breakdown={pest.tempFortuneBreakdown}
				enabled={pest.rates.useTemp}
			/>
			<Switch checked={pest.rates.useTemp} onCheckedChange={(checked) => pest.setUseTemporaryFortune(checked)} />
		</div>
	</SettingHeader>
	<SettingBigSeperator />

	<SettingListItem title={TEMPORARY_FORTUNE.centuryCake.name} wiki={TEMPORARY_FORTUNE.centuryCake.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={5} enabled={pest.rates.temp.centuryCake && pest.rates.useTemp} />
			<Switch
				checked={pest.rates.temp.centuryCake}
				onCheckedChange={(checked) => pest.setTemporaryFortune('centuryCake', checked)}
				disabled={!pest.rates.useTemp}
			/>
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title={pestTurnInTitle} wiki={TEMPORARY_FORTUNE.pestTurnIn.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={200} enabled={pest.rates.temp.pestTurnIn > 0 && pest.rates.useTemp} />
			<Switch
				checked={pest.rates.temp.pestTurnIn > 0}
				onCheckedChange={(checked) => pest.setTemporaryFortune('pestTurnIn', checked ? 200 : 0)}
				disabled={!pest.rates.useTemp}
			/>
		</div>
	</SettingListItem>
	<SettingSeperator />

	{#each temporaryFortuneSources as source (source.key)}
		<SettingListItem title={TEMPORARY_FORTUNE[source.key].name} wiki={TEMPORARY_FORTUNE[source.key].wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				{#if source.stat}
					<FortuneBreakdown
						breakdown={{
							[TEMPORARY_FORTUNE[source.key].name]: { value: source.total, stat: source.stat },
						}}
						enabled={isTemporaryFortuneEnabled(source.key)}
					/>
				{:else}
					<FortuneBreakdown total={source.total} enabled={isTemporaryFortuneEnabled(source.key)} />
				{/if}
				<Switch
					checked={Boolean(pest.rates.temp[source.key])}
					onCheckedChange={(checked) => pest.setTemporaryFortune(source.key, checked)}
					disabled={!pest.rates.useTemp}
				/>
			</div>
		</SettingListItem>
		<SettingSeperator />
	{/each}

	<SettingListItem title={TEMPORARY_FORTUNE.stinkyCheesePotion.name} wiki={TEMPORARY_FORTUNE.stinkyCheesePotion.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown
				breakdown={{
					[TEMPORARY_FORTUNE.stinkyCheesePotion.name]: { value: 20, stat: Stat.BonusPestChance },
				}}
				enabled={pest.rates.useTemp && pest.rates.temp.stinkyCheesePotion}
			/>
			<Switch
				checked={pest.rates.temp.stinkyCheesePotion}
				onCheckedChange={(checked) => pest.setTemporaryFortune('stinkyCheesePotion', checked)}
				disabled={!pest.rates.useTemp}
			/>
		</div>
	</SettingListItem>
	<SettingBigSeperator />

	<SettingHeader class="mt-8 text-xl">Pest Attraction</SettingHeader>
	<p class="text-muted-foreground px-1 text-sm">
		Weights that change which pests spawn. The selected crop's matching pest is applied automatically.
	</p>
	<SettingBigSeperator />

	<SettingListItem
		title="Time of Day"
		description={pest.lockedPestTimeOfDay
			? `${pest.selectedCropName} can only be farmed during ${pest.lockedPestTimeOfDay}.`
			: 'Day excludes Firefly spawns. Night excludes Dragonfly spawns.'}
	>
		<Select.Simple
			class="my-1 h-10 min-w-32"
			value={pest.pestTimeOfDay}
			disabled={!!pest.lockedPestTimeOfDay}
			change={(value) => pest.setPestTimeOfDay(value ?? 'day')}
			options={timeOfDayOptions}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title="Sprayonator Material"
		description="Material used by Sprayonator."
		wiki="https://w.elitesb.gg/Sprayonator"
	>
		<Select.Simple
			class="my-1 h-10 min-w-40"
			value={pest.rates.pestFarming.attraction.sprayonatorMaterial ?? Spray.PlantMatter}
			change={(value) => pest.setPestAttraction('sprayonatorMaterial', value)}
			options={sprayOptions}
		/>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title="Hooverius Vinyl Target"
		description="Extra attracted pest from Hooverius vinyl. Applies only when Hooverius is selected."
	>
		<Select.Simple
			class="my-1 h-10 min-w-40"
			value={pest.rates.pestFarming.attraction.hooveriusVinylTarget ?? Pest.Slug}
			change={(value) => pest.setPestAttraction('hooveriusVinylTarget', value)}
			options={pestOptions}
		/>
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
			inputmode="decimal"
			onValueChange={(value) => pest.setPestRateSetting('blocksPerSecond', value ?? 0)}
			min={0}
			max={20}
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
			inputmode="decimal"
			onValueChange={(value) => pest.setPestRateSetting('spawnBlocksPerSecond', value ?? 0)}
			min={0}
			max={20}
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
			inputmode="decimal"
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
			inputmode="decimal"
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
			inputmode="decimal"
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
			inputmode="decimal"
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
			inputmode="decimal"
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
			inputmode="decimal"
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
			inputmode="decimal"
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
