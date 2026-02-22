<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { NumberInput } from '$ui/number-input';
	import { SliderSimple } from '$ui/slider';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import { FARMING_ENCHANTS, FARMING_TOOLS, FarmingTool, Rarity, REFORGES } from 'farming-weight';

	interface Props {
		tool: FarmingTool;
	}

	let { tool = $bindable() }: Props = $props();

	const rarityOrder = [
		Rarity.Common,
		Rarity.Uncommon,
		Rarity.Rare,
		Rarity.Epic,
		Rarity.Legendary,
		Rarity.Mythic,
		Rarity.Divine,
	];

	const toolOptions = Object.keys(FARMING_TOOLS).map((id) => ({
		value: id,
		label: FARMING_TOOLS[id]?.name ?? id,
	}));

	function getRarityOptionsFor(maxRarity: Rarity) {
		const maxIndex = Math.max(0, rarityOrder.indexOf(maxRarity));
		const minIndex = Math.max(0, maxIndex - 1);
		return rarityOrder.slice(minIndex, maxIndex + 1).map((rarity) => ({
			value: rarity,
			label: rarity,
		}));
	}

	const rarityOptions = $derived.by(() => getRarityOptionsFor(tool.info.maxRarity));

	const reforgeOptions = $derived.by(() =>
		Object.keys(REFORGES)
			.filter((id) => REFORGES[id]?.appliesTo.includes(tool.type))
			.map((id) => ({
				value: id,
				label: REFORGES[id]?.name ?? id,
			}))
	);
	const reforgeStoneOptions = $derived.by(() =>
		reforgeOptions
			.map((option) => {
				const reforge = REFORGES[option.value];
				return {
					...option,
					stoneId: reforge?.stone?.id ?? '',
					stoneName: reforge?.stone?.name ?? option.label,
				};
			})
			.filter((option) => !!option.stoneId)
	);

	const baseEnchants = ['harvesting', 'dedication', 'sunder'];
	const enchantOptions = $derived.by(() => {
		const turbos = Object.entries(FARMING_ENCHANTS)
			.filter(([id, enchant]) => id.startsWith('turbo_') && !!enchant.cropSpecific)
			.filter(([, enchant]) => tool.crops.includes(enchant.cropSpecific!))
			.map(([id]) => id);
		return [...new Set([...baseEnchants, ...turbos])];
	});

	function cloneToolItem() {
		return {
			...tool.item,
			attributes: { ...(tool.item.attributes ?? {}) },
			enchantments: { ...(tool.item.enchantments ?? {}) },
			lore: [...(tool.item.lore ?? [])],
		};
	}

	function patchTool(mutator: (item: ReturnType<typeof cloneToolItem>) => void) {
		const item = cloneToolItem();
		mutator(item);
		tool = new FarmingTool(item, tool.options);
	}

	function setCultivatingLevel(level: number) {
		patchTool((item) => {
			item.enchantments ??= {};
			if (level > 0) {
				item.enchantments.cultivating = Math.max(1, Math.min(10, level));
			} else {
				delete item.enchantments.cultivating;
			}
		});
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center gap-4">
		<ItemRender skyblockId={tool.item.skyblockId ?? ''} class="size-14 shrink-0 rounded-md border bg-black/20 p-1" />
		<div>
			<h3 class="text-lg font-semibold">{tool.info.name}</h3>
			<p class="text-muted-foreground text-sm">Applies to {tool.crops.length} crop(s)</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
		<div class="flex flex-col gap-2">
			<Label>Tool Type</Label>
			<Select.Simple
				options={toolOptions}
				value={tool.item.skyblockId}
				change={(v) => {
					if (v) {
						patchTool((item) => {
							item.skyblockId = v;
							item.name = FARMING_TOOLS[v]?.name ?? v;
						});
					}
				}}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Rarity</Label>
			<Select.Simple
				options={rarityOptions}
				value={tool.rarity}
				change={(v) => {
					if (v) {
						patchTool((item) => {
							item.lore = [v.toUpperCase()];
						});
					}
				}}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Reforge</Label>
			<Select.Simple
				options={reforgeOptions}
				value={tool.reforge?.name.toLowerCase() ?? ''}
				change={(v) => {
					if (v) {
						patchTool((item) => {
							item.attributes.modifier = v;
						});
					}
				}}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Tool Level</Label>
			<div class="flex items-center gap-3">
				<SliderSimple
					class="h-8 grow"
					min={1}
					max={50}
					step={1}
					value={tool.level}
					onValueChange={(v) => {
						const value = Array.isArray(v) ? v[0] : v;
						if (value) {
							patchTool((item) => {
								item.attributes.levelable_lvl = Math.max(1, Math.min(50, value)).toString();
							});
						}
					}}
				/>
				<span class="w-8 text-right text-sm font-semibold">{tool.level}</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2">
		<Label>Recombobulated</Label>
		<Switch
			checked={tool.recombobulated}
			onCheckedChange={(v) => {
				patchTool((item) => {
					item.attributes.rarity_upgrades = v ? '1' : '0';
				});
			}}
		/>
	</div>

	<div class="flex flex-col gap-3">
		<Label>Reforge Stone</Label>
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each reforgeStoneOptions as option (option.value)}
				<Button
					type="button"
					variant={tool.item.attributes?.modifier === option.value ? 'default' : 'outline'}
					class="h-auto flex-col gap-2 py-3"
					onclick={() =>
						patchTool((item) => {
							item.attributes.modifier = option.value;
						})}
				>
					<ItemRender skyblockId={option.stoneId} class="size-9 rounded-sm p-0" />
					<span class="text-center text-xs">{option.stoneName}</span>
				</Button>
			{/each}
		</div>
	</div>

	<div class="flex flex-col gap-3">
		<Label>Cultivating Enchant ({(tool.item.enchantments?.cultivating as number) ?? 0})</Label>
		<SliderSimple
			class="h-8"
			min={0}
			max={10}
			step={1}
			value={(tool.item.enchantments?.cultivating as number) ?? 0}
			onValueChange={(v) => {
				const value = Array.isArray(v) ? v[0] : v;
				if (value !== undefined) setCultivatingLevel(value);
			}}
		/>
	</div>

	<div class="flex flex-col gap-3">
		<h3 class="border-b pb-1 text-lg font-semibold">Enchantments</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
			{#each enchantOptions as enchantId (enchantId)}
				{@const enchant = FARMING_ENCHANTS[enchantId]}
				{#if enchant}
					<div class="flex flex-col gap-1">
						<Label class="text-xs">{enchant.name}</Label>
						<NumberInput
							min="0"
							max={enchant.maxLevel}
							value={(tool.item.enchantments?.[enchantId] as number) ?? 0}
							onValueChange={(val) => {
								if (val === undefined) return;
								patchTool((item) => {
									if (val > 0) {
										item.enchantments[enchantId] = val;
									} else {
										delete item.enchantments[enchantId];
									}
								});
							}}
						/>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
