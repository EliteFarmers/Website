<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import FortuneSettingsSaveBar from '$comp/rates/settings/fortune-settings-save-bar.svelte';
	import ManualSetting from '$comp/rates/settings/manual-setting.svelte';
	import SettingBigSeperator from '$comp/settings/setting-big-seperator.svelte';
	import SettingHeader from '$comp/settings/setting-header.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import {
		compareRarity,
		GARDEN_WEATHER,
		GARDEN_CHIP_RARITIES,
		GARDEN_CHIPS,
		getChipInputLevel,
		getChipInputRarity,
		getChipRarity,
		Stat,
		TEMPORARY_FORTUNE,
		ZorroMode,
		type GardenChipId,
		type GardenChipRarity,
		type StatBreakdown,
	} from 'farming-weight';

	const ratesData = getRatesData();
	const ctx = getStatsContext();

	interface Props {
		tempFortune?: number;
		tempFortuneBreakdown?: StatBreakdown;
		pestFarmingPopup?: boolean;
	}

	let { tempFortune, tempFortuneBreakdown, pestFarmingPopup = false }: Props = $props();

	const gardenChipEntries = Object.entries(GARDEN_CHIPS) as [GardenChipId, (typeof GARDEN_CHIPS)[GardenChipId]][];

	function getDetectedChipLevel(chipId: GardenChipId) {
		const chips = (ctx.member.current?.memberData?.garden?.chips ?? {}) as Record<
			string,
			number | null | undefined
		>;
		return getChipInputLevel(chips, chipId);
	}

	function getSavedChipRarity(chipId: GardenChipId) {
		return getChipInputRarity($ratesData.chipRarities, chipId);
	}

	function getChipRarityOptions(chipId: GardenChipId) {
		const inferred = getChipRarity(getDetectedChipLevel(chipId));
		return [
			{
				value: '',
				label: `Inferred (${inferred})`,
			},
			...GARDEN_CHIP_RARITIES.filter((rarity) => compareRarity(rarity, inferred) >= 0).map((rarity) => ({
				value: rarity,
				label: rarity,
			})),
		];
	}

	function setSavedChipRarity(chipId: GardenChipId, rarity?: GardenChipRarity | string) {
		const chip = GARDEN_CHIPS[chipId];
		const next = { ...($ratesData.chipRarities ?? {}) };
		delete next[chipId];
		delete next[chip.skyblockId];
		if (rarity) {
			next[chip.skyblockId] = rarity;
		}
		$ratesData.chipRarities = next;
	}
</script>

<div class="relative w-full max-w-2xl flex-1 flex-col justify-center rounded-md p-0 sm:p-4">
	<SettingHeader class="mt-0 text-2xl">Fortune Settings</SettingHeader>
	<SettingBigSeperator />
	<ManualSetting setting="communityCenter" />
	<SettingSeperator />
	<SettingListItem
		title="Strength"
		description="Used for Mooshroom Cow ability."
		wiki="https://w.elitesb.gg/Strength"
	>
		<NumberInput
			class="my-1 h-10 max-w-32"
			type="text"
			inputmode="numeric"
			placeholder="0"
			bind:value={$ratesData.strength}
			min={0}
			max={2500}
		/>
	</SettingListItem>
	<SettingSeperator />
	<SettingListItem
		title="Speed"
		description="Current total Speed used by the Orchid Mantis' Swift Sickles ability."
		wiki="https://w.elitesb.gg/Orchid_Mantis_Pet"
	>
		<NumberInput
			class="my-1 h-10 max-w-32"
			type="text"
			inputmode="numeric"
			placeholder="400"
			bind:value={$ratesData.speed}
			min={0}
			max={1000}
		/>
	</SettingListItem>
	<SettingSeperator />
	{#if !pestFarmingPopup}
		<ManualSetting setting="feastBurgers" />
		<SettingSeperator />
	{/if}
	<ManualSetting setting="filledRosewaterFlask" />
	<SettingSeperator />

	{#if !pestFarmingPopup}
		<SettingHeader class="mt-8 font-normal">
			<span class="text-xl font-semibold">Temporary Fortune</span>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={tempFortune} breakdown={tempFortuneBreakdown} enabled={$ratesData.useTemp} />

				{#if $ratesData.useTemp !== undefined}
					<Switch bind:checked={$ratesData.useTemp} />
				{/if}
			</div>
		</SettingHeader>
		<SettingBigSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.centuryCake.name} wiki={TEMPORARY_FORTUNE.centuryCake.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={5} enabled={$ratesData.temp.centuryCake && $ratesData.useTemp} />

				{#if $ratesData.temp.centuryCake !== undefined}
					<Switch bind:checked={$ratesData.temp.centuryCake} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem
			title="{TEMPORARY_FORTUNE.pestTurnIn.name} (40 Pests)"
			wiki={TEMPORARY_FORTUNE.pestTurnIn.wiki}
		>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={200} enabled={$ratesData.temp.pestTurnIn > 0 && $ratesData.useTemp} />

				<Switch
					checked={$ratesData.temp.pestTurnIn > 0}
					onCheckedChange={(check) => {
						$ratesData.temp.pestTurnIn = check ? 200 : 0;
					}}
					disabled={!$ratesData.useTemp}
				/>
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.harvestPotion.name} wiki={TEMPORARY_FORTUNE.harvestPotion.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={50} enabled={$ratesData.temp.harvestPotion && $ratesData.useTemp} />

				{#if $ratesData.temp.harvestPotion !== undefined}
					<Switch bind:checked={$ratesData.temp.harvestPotion} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.magic8Ball.name} wiki={TEMPORARY_FORTUNE.magic8Ball.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={25} enabled={$ratesData.temp.magic8Ball && $ratesData.useTemp} />

				{#if $ratesData.temp.magic8Ball !== undefined}
					<Switch bind:checked={$ratesData.temp.magic8Ball} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.springFilter.name} wiki={TEMPORARY_FORTUNE.springFilter.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={25} enabled={$ratesData.temp.springFilter && $ratesData.useTemp} />

				{#if $ratesData.temp.springFilter !== undefined}
					<Switch bind:checked={$ratesData.temp.springFilter} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem
			title={TEMPORARY_FORTUNE.anitaContest.name}
			description="Applies Anita's Artifact boosted-contest fortune."
			wiki={TEMPORARY_FORTUNE.anitaContest.wiki}
		>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={25} enabled={$ratesData.temp.anitaContest && $ratesData.useTemp} />

				{#if $ratesData.temp.anitaContest !== undefined}
					<Switch bind:checked={$ratesData.temp.anitaContest} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.chocolateTruffle.name} wiki={TEMPORARY_FORTUNE.chocolateTruffle.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown
					stat={Stat.CocoaBeanFortune}
					total={30}
					enabled={$ratesData.temp.chocolateTruffle && $ratesData.useTemp}
				/>

				{#if $ratesData.temp.chocolateTruffle !== undefined}
					<Switch bind:checked={$ratesData.temp.chocolateTruffle} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem
			title={TEMPORARY_FORTUNE.celestialMasonJar.name}
			wiki={TEMPORARY_FORTUNE.celestialMasonJar.wiki}
		>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={15} enabled={$ratesData.temp.celestialMasonJar && $ratesData.useTemp} />

				{#if $ratesData.temp.celestialMasonJar !== undefined}
					<Switch bind:checked={$ratesData.temp.celestialMasonJar} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.melonJuiceMixin.name} wiki={TEMPORARY_FORTUNE.melonJuiceMixin.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown total={15} enabled={$ratesData.temp.melonJuiceMixin && $ratesData.useTemp} />

				{#if $ratesData.temp.melonJuiceMixin !== undefined}
					<Switch bind:checked={$ratesData.temp.melonJuiceMixin} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem title={TEMPORARY_FORTUNE.finnsFocaccia.name} wiki={TEMPORARY_FORTUNE.finnsFocaccia.wiki}>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown
					breakdown={{ [TEMPORARY_FORTUNE.finnsFocaccia.name]: { value: 5, stat: Stat.Overbloom } }}
					enabled={$ratesData.temp.finnsFocaccia && $ratesData.useTemp}
				/>

				{#if $ratesData.temp.finnsFocaccia !== undefined}
					<Switch bind:checked={$ratesData.temp.finnsFocaccia} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />

		<SettingListItem
			title={TEMPORARY_FORTUNE.stinkyCheesePotion.name}
			wiki={TEMPORARY_FORTUNE.stinkyCheesePotion.wiki}
		>
			<div
				class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center"
			>
				<FortuneBreakdown
					breakdown={{
						[TEMPORARY_FORTUNE.stinkyCheesePotion.name]: { value: 20, stat: Stat.BonusPestChance },
					}}
					enabled={$ratesData.temp.stinkyCheesePotion && $ratesData.useTemp}
				/>

				{#if $ratesData.temp.stinkyCheesePotion !== undefined}
					<Switch bind:checked={$ratesData.temp.stinkyCheesePotion} disabled={!$ratesData.useTemp} />
				{/if}
			</div>
		</SettingListItem>
		<SettingSeperator />
	{/if}

	<SettingHeader class="mt-8 text-xl">Other Settings</SettingHeader>
	<SettingBigSeperator />

	{#if !pestFarmingPopup}
		<ManualSetting setting="sprayedPlot" />
		<SettingSeperator />
	{/if}

	<SettingListItem
		title="Infested Plot"
		description="How much of your time is spent farming in an infested plot. Used for Termite Shard."
	>
		{#snippet child()}
			<div class="mr-2 flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<div class="flex flex-1 flex-row items-center gap-1">
					<p class="w-12 p-2 pl-4 text-right text-lg">
						{Math.round(($ratesData.infestedPlotProbability ?? 0) * 100)}%
					</p>
					{#if $ratesData.infestedPlotProbability !== undefined}
						<SliderSimple
							class="h-12 flex-1"
							min={0}
							max={1}
							bind:value={$ratesData.infestedPlotProbability}
							step={0.01}
						/>
					{/if}
				</div>
			</div>
		{/snippet}
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="Zorro's Cape Mode" description="The mode to use for Zorro's cape fortune.">
		{#snippet child()}
			<div class="flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<Select.Simple
					value={$ratesData.zorroMode}
					change={(value) => {
						$ratesData.zorroMode = value ?? $ratesData.zorroMode;
					}}
					options={[
						{
							value: ZorroMode.Normal,
							label: 'Outside Contest',
						},
						{
							value: ZorroMode.Averaged,
							label: 'Averaged',
						},
						{
							value: ZorroMode.Contest,
							label: 'Inside Contest',
						},
					]}
				/>
			</div>
		{/snippet}
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem
		title="Garden Weather"
		description="Include garden weather buffs in rates. Averaged spreads Rain and Blooming over the time no weather is active."
		wiki="https://w.elitesb.gg/Garden_Weather"
	>
		{#snippet child()}
			<div class="flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<Select.Simple
					value={$ratesData.gardenWeather}
					change={(value) => {
						$ratesData.gardenWeather = value ?? $ratesData.gardenWeather;
					}}
					options={[
						{ value: 'off', label: 'Off' },
						{ value: 'averaged', label: 'Averaged' },
						{ value: 'mild', label: GARDEN_WEATHER.mild.name },
						{ value: 'extreme', label: GARDEN_WEATHER.extreme.name },
					]}
				/>
			</div>
		{/snippet}
	</SettingListItem>
	<SettingSeperator />

	<SettingHeader class="mt-8 text-xl">Garden Chips</SettingHeader>
	<p class="px-1 text-sm text-muted-foreground">Set the rarity of each garden chip you have.</p>
	<SettingBigSeperator />

	{#each gardenChipEntries as [chipId, chip], index (chipId)}
		{@const level = getDetectedChipLevel(chipId)}
		{@const savedRarity = getSavedChipRarity(chipId)}
		{@const effectiveRarity = getChipRarity(level, savedRarity)}
		<SettingListItem
			title={chip.name}
			description={`Level ${level.toLocaleString()} - ${effectiveRarity}`}
			wiki={chip.wiki}
		>
			{#snippet child()}
				<div class="flex w-full max-w-80 flex-row items-center justify-end gap-2">
					{#if chipId === 'overdrive'}
						<span class="text-sm text-muted-foreground">Contest active</span>
						<Switch bind:checked={$ratesData.overdriveActive} />
					{/if}
					<span class="w-14 text-right text-sm text-muted-foreground">Lvl {level.toLocaleString()}</span>
					<Select.Simple
						size="sm"
						value={savedRarity ?? ''}
						change={(value) => {
							setSavedChipRarity(chipId, value || undefined);
						}}
						options={getChipRarityOptions(chipId)}
					/>
				</div>
			{/snippet}
		</SettingListItem>
		{#if index < gardenChipEntries.length - 1}
			<SettingSeperator />
		{/if}
	{/each}

	<SettingBigSeperator />

	{#if !pestFarmingPopup}
		<FortuneSettingsSaveBar />
	{/if}
</div>
