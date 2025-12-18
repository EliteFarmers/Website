<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import ItemRender from '$comp/items/item-render.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import SettingBigSeperator from '$comp/settings/setting-big-seperator.svelte';
	import SettingHeader from '$comp/settings/setting-header.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getRatesData } from '$lib/stores/ratesData';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import { TEMPORARY_FORTUNE, ZorroMode } from 'farming-weight';
	import { FARMING_ATTRIBUTE_SHARDS } from 'farming-weight/dist/constants/attributes';
	import { GARDEN_CHIPS } from 'farming-weight/dist/constants/chips';
	import ShardSetting from './shard-setting.svelte';

	const ratesData = getRatesData();
	const gbl = getGlobalContext();
	const ctx = getStatsContext();

	const owned = $derived(gbl.authorized && gbl.ownsAccount(ctx.uuid));
	let loading = $state(false);

	interface Props {
		player: RatesPlayerStore;
	}

	let { player }: Props = $props();
</script>

<div class="relative w-full max-w-2xl flex-1 flex-col justify-center rounded-md p-0 sm:p-4">
	<SettingHeader class="mt-0 text-2xl">Fortune Settings</SettingHeader>
	<SettingBigSeperator />
	<SettingListItem
		title="Garden Fortune"
		description="Community center farming fortune upgrade."
		wiki="https://wiki.hypixel.net/Elizabeth#Garden_Farming_Fortune_"
	>
		{#snippet child()}
			<div class="mr-2 flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<div class="flex flex-1 flex-row items-center gap-1">
					<p class="w-12 p-2 pl-4 text-center text-lg">{$ratesData.communityCenter}</p>
					{#if $ratesData.communityCenter !== undefined}
						<SliderSimple
							class="h-12 flex-1"
							min={0}
							max={10}
							bind:value={$ratesData.communityCenter}
							step={1}
						/>
					{/if}
				</div>
			</div>
		{/snippet}
	</SettingListItem>
	<SettingSeperator />
	<SettingListItem
		title="Strength"
		description="Used for Mooshroom Cow ability."
		wiki="https://wiki.hypixel.net/Strength"
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

	<SettingHeader class="mt-8 font-normal">
		<span class="text-xl font-semibold">Temporary Fortune</span>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown
				total={$player.tempFortune}
				breakdown={$player.tempFortuneBreakdown}
				enabled={$ratesData.useTemp}
			/>

			{#if $ratesData.useTemp !== undefined}
				<Switch bind:checked={$ratesData.useTemp} />
			{/if}
		</div>
	</SettingHeader>
	<SettingBigSeperator />

	<SettingListItem title={TEMPORARY_FORTUNE.centuryCake.name} wiki={TEMPORARY_FORTUNE.centuryCake.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={5} enabled={$ratesData.temp.centuryCake && $ratesData.useTemp} />

			{#if $ratesData.temp.centuryCake !== undefined}
				<Switch bind:checked={$ratesData.temp.centuryCake} disabled={!$ratesData.useTemp} />
			{/if}
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title="{TEMPORARY_FORTUNE.pestTurnIn.name} (40 Pests)" wiki={TEMPORARY_FORTUNE.pestTurnIn.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
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
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={50} enabled={$ratesData.temp.harvestPotion && $ratesData.useTemp} />

			{#if $ratesData.temp.harvestPotion !== undefined}
				<Switch bind:checked={$ratesData.temp.harvestPotion} disabled={!$ratesData.useTemp} />
			{/if}
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title={TEMPORARY_FORTUNE.magic8Ball.name} wiki={TEMPORARY_FORTUNE.magic8Ball.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={25} enabled={$ratesData.temp.magic8Ball && $ratesData.useTemp} />

			{#if $ratesData.temp.magic8Ball !== undefined}
				<Switch bind:checked={$ratesData.temp.magic8Ball} disabled={!$ratesData.useTemp} />
			{/if}
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title={TEMPORARY_FORTUNE.springFilter.name} wiki={TEMPORARY_FORTUNE.springFilter.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={25} enabled={$ratesData.temp.springFilter && $ratesData.useTemp} />

			{#if $ratesData.temp.springFilter !== undefined}
				<Switch bind:checked={$ratesData.temp.springFilter} disabled={!$ratesData.useTemp} />
			{/if}
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title={TEMPORARY_FORTUNE.anitaContest.name} wiki={TEMPORARY_FORTUNE.anitaContest.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={25} enabled={$ratesData.temp.anitaContest && $ratesData.useTemp} />

			{#if $ratesData.temp.anitaContest !== undefined}
				<Switch bind:checked={$ratesData.temp.anitaContest} disabled={!$ratesData.useTemp} />
			{/if}
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingListItem title={TEMPORARY_FORTUNE.chocolateTruffle.name} wiki={TEMPORARY_FORTUNE.chocolateTruffle.wiki}>
		<div class="flex flex-col-reverse items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-center">
			<FortuneBreakdown total={30} enabled={$ratesData.temp.chocolateTruffle && $ratesData.useTemp} />

			{#if $ratesData.temp.chocolateTruffle !== undefined}
				<Switch bind:checked={$ratesData.temp.chocolateTruffle} disabled={!$ratesData.useTemp} />
			{/if}
		</div>
	</SettingListItem>
	<SettingSeperator />

	<SettingHeader class="mt-8 text-xl">Other Settings</SettingHeader>
	<SettingBigSeperator />

	<SettingListItem title="Sprayed Plot" description="If you're farming in a sprayed plot. Used for Slug pet ability.">
		{#if $ratesData.sprayedPlot !== undefined}
			<Switch bind:checked={$ratesData.sprayedPlot} />
		{/if}
	</SettingListItem>
	<SettingSeperator />

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

	<SettingHeader class="mt-8 text-xl">Attribute Shards</SettingHeader>
	<p class="text-muted-foreground px-1 text-sm">
		Set the amount of each attribute shard you have! This is unfortunately necessary since Hypixel hasn't added them
		to the API yet.
	</p>
	<SettingBigSeperator />

	{#each Object.values(FARMING_ATTRIBUTE_SHARDS).filter((shard) => shard.effect === 'fortune' || shard.effect === 'rates') as shard (shard.skyblockId)}
		<SettingListItem title={shard.name}>
			<ShardSetting
				{shard}
				amount={$ratesData.attributes[shard.skyblockId]}
				onChange={(v) => {
					$ratesData.attributes[shard.skyblockId] = v;
				}}
			/>
		</SettingListItem>
		<SettingSeperator />
	{/each}

	<SettingHeader class="mt-8 text-xl">Garden Chips</SettingHeader>
	<p class="text-muted-foreground px-1 text-sm">
		Set the level of each garden chip you have! This is unfortunately necessary since Hypixel hasn't added them to
		the API yet.
	</p>
	<SettingBigSeperator />

	{#each Object.values(GARDEN_CHIPS) as chip (chip.skyblockId)}
		<SettingListItem title={chip.name} wiki={chip.wiki}>
			{#snippet icon()}
				<ItemRender skyblockId={chip.skyblockId} class="size-10" />
			{/snippet}
			<div class="mr-2 flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<div class="flex flex-1 flex-row items-center gap-1">
					<p class="w-12 p-2 pl-4 text-center text-lg">{$ratesData.chips[chip.skyblockId]}</p>
					{#if $ratesData.chips[chip.skyblockId] !== undefined}
						<Select.Simple
							options={Array.from({ length: 21 }, (_, i) => ({
								value: i,
								label: i == 0 ? 'None' : `Level ${i}`,
							}))}
							value={$ratesData.chips[chip.skyblockId]}
							change={(value) => {
								$ratesData.chips[chip.skyblockId] = value ?? $ratesData.chips[chip.skyblockId];
							}}
							class="w-24"
							placeholder="Level"
						/>
					{/if}
				</div>
			</div>
		</SettingListItem>
		<SettingSeperator />
	{/each}

	<SettingHeader class="mt-8 text-xl">Exported Crops</SettingHeader>
	<span class="text-muted-foreground px-1 text-sm"
		>Crop that you've brought items to <a
			href="https://wiki.hypixel.net/Carrolyn"
			target="_blank"
			class="text-link underline">Carrolyn</a
		> for.</span
	>
	<SettingBigSeperator />

	<p class="border-completed rounded-md border p-2 text-sm">
		These toggles have been removed! Exported crops are now automatically detected from your profile data!
	</p>

	<SettingBigSeperator />

	{#if owned || ctx.fortuneSettings}
		<div class="h-16"></div>
		<div
			class="bg-background fixed right-0 bottom-0 left-0 z-50 flex w-full max-w-2xl flex-col items-center justify-center gap-2 border-t p-4"
		>
			{#if ctx.fortuneSettings && !owned}
				<p class="text-muted-foreground px-1 text-sm">
					Loaded saved settings from {ctx.ignMeta}!
				</p>
			{/if}
			{#if owned}
				<div class="flex flex-row items-center justify-between gap-2">
					<form
						class="flex flex-row items-center justify-between gap-4"
						action="?/save"
						method="post"
						use:enhance={() => {
							loading = true;

							return async ({ result }) => {
								await applyAction(result);
								loading = false;
							};
						}}
					>
						<p class="text-muted-foreground max-w-sm text-sm">
							Strength, garden fortune, garden chips, and attribute shards can be saved to your profile!
						</p>
						<input type="hidden" name="player" value={ctx.uuid} />
						<input type="hidden" name="profile" value={ctx.selectedProfile?.profileId} />
						{#each Object.values(FARMING_ATTRIBUTE_SHARDS).filter((shard) => shard.effect === 'fortune' || shard.effect === 'rates') as shard (shard.skyblockId)}
							<input
								type="hidden"
								name={shard.skyblockId}
								value={$ratesData.attributes[shard.skyblockId] ?? 0}
							/>
						{/each}
						{#each Object.values(GARDEN_CHIPS) as chip (chip.skyblockId)}
							<input
								type="hidden"
								name={chip.skyblockId}
								value={$ratesData.chips[chip.skyblockId] ?? 0}
							/>
						{/each} <input type="hidden" name="community" value={$ratesData.communityCenter ?? 0} />
						<input type="hidden" name="strength" value={$ratesData.strength ?? 0} />
						<Button type="submit" disabled={loading}>Save</Button>
					</form>
				</div>
			{/if}
		</div>
	{/if}
</div>
