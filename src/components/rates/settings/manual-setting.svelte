<script lang="ts">
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import { getSprayonatorTierOptions } from '$lib/rates/sprayonator';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import type { ManualSettingId } from 'farming-weight';

	let { setting }: { setting: ManualSettingId } = $props();

	const ratesData = getRatesData();

	const ctx = getStatsContext();
	const sprayonatorTierOptions = $derived(getSprayonatorTierOptions(ctx.farmingInventory.current));
</script>

{#if setting === 'communityCenter'}
	<SettingListItem
		title="Garden Fortune"
		description="Community center farming fortune upgrade."
		wiki="https://w.elitesb.gg/Account_%26_Profile_Upgrades#Account_Upgrades"
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
{:else if setting === 'feastBurgers'}
	<SettingListItem
		title="Feast Burgers"
		description="Amount of Feast Burgers with a Side of Deepfries you've consumed."
		wiki="https://w.elitesb.gg/Feast_Burger_with_a_Side_of_Deepfries"
	>
		{#snippet child()}
			<div class="mr-2 flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<div class="flex flex-1 flex-row items-center gap-1">
					<p class="w-12 p-2 pl-4 text-center text-lg">{$ratesData.feastBurgers}</p>
					<SliderSimple class="h-12 flex-1" min={0} max={5} bind:value={$ratesData.feastBurgers} step={1} />
				</div>
			</div>
		{/snippet}
	</SettingListItem>
{:else if setting === 'filledRosewaterFlask'}
	<SettingListItem
		title="Filled Rosewater Flasks"
		description="Amount of Filled Rosewater Flasks you've consumed."
		wiki="https://w.elitesb.gg/Rosewater_Flask"
	>
		{#snippet child()}
			<div class="mr-2 flex w-full max-w-32 flex-row items-center justify-end md:max-w-48">
				<div class="flex flex-1 flex-row items-center gap-1">
					<p class="w-12 p-2 pl-4 text-center text-lg">{$ratesData.rosewaterFlasks}</p>
					{#if $ratesData.rosewaterFlasks !== undefined}
						<SliderSimple
							class="h-12 flex-1"
							min={0}
							max={5}
							bind:value={$ratesData.rosewaterFlasks}
							step={1}
						/>
					{/if}
				</div>
			</div>
		{/snippet}
	</SettingListItem>
{:else if setting === 'sprayedPlot'}
	<SettingListItem
		title="Sprayed Plot"
		description="Sprayer tier controls the material effect and Bonus Pest Chance."
		wiki="https://w.elitesb.gg/Sprayonator"
	>
		<div class="flex items-center gap-2">
			<Select.Simple
				class="my-1 h-10 min-w-40"
				value={$ratesData.sprayonator}
				change={(value) => ($ratesData.sprayonator = value ?? 'auto')}
				options={sprayonatorTierOptions}
			/>
			{#if $ratesData.sprayedPlot !== undefined}
				<Switch bind:checked={$ratesData.sprayedPlot} />
			{/if}
		</div>
	</SettingListItem>
{/if}
