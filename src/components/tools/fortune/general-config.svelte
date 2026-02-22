<script lang="ts">
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import { CROP_INFO, type Crop, type PlayerOptions, ZorroMode } from 'farming-weight';

	interface Props {
		options: PlayerOptions;
		selectedCrop: Crop;
	}

	let { options = $bindable(), selectedCrop }: Props = $props();

	const zorroModes = Object.values(ZorroMode).map((mode) => ({
		value: mode,
		label: mode.charAt(0).toUpperCase() + mode.slice(1),
	}));

	options.milestones ??= {};
	options.cropUpgrades ??= {};

	const selectedCropName = $derived(CROP_INFO[selectedCrop]?.name ?? 'Selected Crop');
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<!-- Garden Stats -->
	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Garden Stats</h3>

		<div class="flex flex-col gap-2">
			<Label>Garden Level</Label>
			<Input type="number" bind:value={options.gardenLevel} min="0" max="15" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Plots Unlocked</Label>
			<Input type="number" bind:value={options.plotsUnlocked} min="0" max="24" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Unique Visitors</Label>
			<Input type="number" bind:value={options.uniqueVisitors} min="0" max="80" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Community Center Upgrade</Label>
			<Input type="number" bind:value={options.communityCenter} min="0" max="5" />
		</div>
	</div>

	<!-- Player Levels -->
	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Player Levels</h3>

		<div class="flex flex-col gap-2">
			<Label>Farming Level</Label>
			<Input type="number" bind:value={options.farmingLevel} min="0" max="60" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Strength</Label>
			<Input type="number" bind:value={options.strength} min="0" />
		</div>

		<div class="flex items-center gap-2">
			<Switch
				checked={options.personalBestsUnlocked ?? false}
				onCheckedChange={(v) => (options.personalBestsUnlocked = v)}
			/>
			<Label>Personal Bests Unlocked</Label>
		</div>
	</div>

	<!-- Misc Upgrades -->
	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Misc Upgrades</h3>

		<div class="flex flex-col gap-2">
			<Label>Anita Bonus (Double Drops)</Label>
			<Input type="number" bind:value={options.anitaBonus} min="0" max="5" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Refined Truffles</Label>
			<Input type="number" bind:value={options.refinedTruffles} min="0" max="10" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Cocoa Fortune Upgrade</Label>
			<Input type="number" bind:value={options.cocoaFortuneUpgrade} min="0" max="16" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Filled Rosewater Flask</Label>
			<Input type="number" bind:value={options.filledRosewaterFlask} min="0" max="5" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>DNA Milestone</Label>
			<Input type="number" bind:value={options.dnaMilestone} min="0" />
		</div>
	</div>

	<!-- Plot Modifiers -->
	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Plot Modifiers</h3>

		<div class="flex items-center gap-2">
			<Switch checked={options.sprayedPlot} onCheckedChange={(v) => (options.sprayedPlot = v)} />
			<Label>Sprayed Plot</Label>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Infested Plot Prob.</Label>
			<Input type="number" bind:value={options.infestedPlotProbability} min="0" max="1" step="0.01" />
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">{selectedCropName} Stats</h3>

		<div class="flex flex-col gap-2">
			<Label>{selectedCropName} Milestone</Label>
			<Input
				type="number"
				value={options.milestones?.[selectedCrop] ?? 0}
				min="0"
				oninput={(e) => {
					const val = Number.parseInt(e.currentTarget.value, 10);
					options.milestones ??= {};
					options.milestones[selectedCrop] = Number.isNaN(val) ? 0 : val;
				}}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<Label>{selectedCropName} Upgrade</Label>
			<Input
				type="number"
				value={options.cropUpgrades?.[selectedCrop] ?? 0}
				min="0"
				oninput={(e) => {
					const val = Number.parseInt(e.currentTarget.value, 10);
					options.cropUpgrades ??= {};
					options.cropUpgrades[selectedCrop] = Number.isNaN(val) ? 0 : val;
				}}
			/>
		</div>
	</div>

	<!-- Zorro -->
	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Zorro Mode</h3>

		<div class="flex items-center gap-2">
			<Switch
				checked={options.zorro?.enabled ?? false}
				onCheckedChange={(v) => {
					options.zorro ??= { enabled: true, mode: ZorroMode.Averaged };
					options.zorro.enabled = v;
				}}
			/>
			<Label>Zorro Enabled</Label>
		</div>

		{#if options.zorro?.enabled}
			<div class="flex flex-col gap-2">
				<Label>Mode</Label>
				<Select.Simple options={zorroModes} bind:value={options.zorro.mode} />
			</div>
		{/if}
	</div>
</div>
