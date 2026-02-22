<script lang="ts">
	import ArmorConfig from '$comp/tools/fortune/armor-config.svelte';
	import GeneralConfig from '$comp/tools/fortune/general-config.svelte';
	import PetConfig from '$comp/tools/fortune/pet-config.svelte';
	import ToolConfig from '$comp/tools/fortune/tool-config.svelte';
	import * as Tabs from '$ui/tabs';
	import type { FortuneSandboxPlayerGearSource } from '$lib/schemas/tool-settings/fortune-sandbox';
	import { LotusGear, type Crop, type FarmingArmor, type FarmingPet, type FarmingTool, type PlayerOptions } from 'farming-weight';

	type SideKey = 'A' | 'B';
	type LinkSection = 'pet' | 'tool' | 'armorEquipment' | 'stats';

	interface RuntimeSideState {
		options: PlayerOptions;
		pet: FarmingPet;
		toolsByCrop: Record<string, FarmingTool>;
		armor: FarmingArmor[];
		equipment: InstanceType<typeof LotusGear>[];
		playerGearSource: FortuneSandboxPlayerGearSource | null;
	}

	interface Props {
		sideKey: SideKey;
		side: RuntimeSideState;
		selectedCropKey: Crop;
		onSectionInteraction: (sideKey: SideKey, section: LinkSection) => void;
		createDefaultTool: (crop: Crop, options: PlayerOptions) => FarmingTool;
	}

	let { sideKey, side = $bindable(), selectedCropKey, onSectionInteraction, createDefaultTool }: Props = $props();
</script>

<Tabs.Root value="items" class="w-full">
	<Tabs.List class="w-full">
		<Tabs.Trigger value="items" class="flex-1">Items (Pet/Tool)</Tabs.Trigger>
		<Tabs.Trigger value="armor" class="flex-1">Armor/Equipment</Tabs.Trigger>
		<Tabs.Trigger value="stats" class="flex-1">Garden/Player Stats</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="items" class="mt-4 flex flex-col gap-6">
		<section
			class="bg-card rounded-lg border p-4"
			role="group"
			onpointerdown={(event) => {
				void event;
				onSectionInteraction(sideKey, 'pet');
			}}
			onfocusin={(event) => {
				void event;
				onSectionInteraction(sideKey, 'pet');
			}}
		>
			<h2 class="mb-4 text-xl font-semibold">Pet Configuration</h2>
			<PetConfig
				bind:pet={
					() => side.pet,
					(value) => {
						side.pet = value;
					}
				}
			/>
		</section>

		<section
			class="bg-card rounded-lg border p-4"
			role="group"
			onpointerdown={(event) => {
				void event;
				onSectionInteraction(sideKey, 'tool');
			}}
			onfocusin={(event) => {
				void event;
				onSectionInteraction(sideKey, 'tool');
			}}
		>
			<h2 class="mb-4 text-xl font-semibold">Tool Configuration</h2>
			<ToolConfig
				bind:tool={
					() => side.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, side.options),
					(tool) => {
						side.toolsByCrop = {
							...side.toolsByCrop,
							[String(selectedCropKey)]: tool,
						};
					}
				}
			/>
		</section>
	</Tabs.Content>
	<Tabs.Content
		value="armor"
		class="mt-4"
		onpointerdown={(event) => {
			void event;
			onSectionInteraction(sideKey, 'armorEquipment');
		}}
		onfocusin={(event) => {
			void event;
			onSectionInteraction(sideKey, 'armorEquipment');
		}}
	>
		<section class="bg-card rounded-lg border p-4">
			<ArmorConfig
				bind:armor={
					() => side.armor,
					(value) => {
						side.armor = value;
					}
				}
				bind:equipment={
					() => side.equipment,
					(value) => {
						side.equipment = value;
					}
				}
				options={side.options}
			/>
		</section>
	</Tabs.Content>
	<Tabs.Content
		value="stats"
		class="mt-4"
		onpointerdown={(event) => {
			void event;
			onSectionInteraction(sideKey, 'stats');
		}}
		onfocusin={(event) => {
			void event;
			onSectionInteraction(sideKey, 'stats');
		}}
	>
		<section class="bg-card rounded-lg border p-4">
			<GeneralConfig
				bind:options={
					() => side.options,
					(value) => {
						side.options = value;
					}
				}
				selectedCrop={selectedCropKey}
			/>
		</section>
	</Tabs.Content>
</Tabs.Root>
