<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import SettingBigSeperator from '$comp/settings/setting-big-seperator.svelte';
	import SettingHeader from '$comp/settings/setting-header.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { Switch } from '$ui/switch';
	import { Stat, TEMPORARY_FORTUNE } from 'farming-weight';
	import type { PestFarmingPageContext } from './pest-farming-context.svelte';

	interface Props {
		pest: PestFarmingPageContext;
	}

	let { pest }: Props = $props();
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
</div>
