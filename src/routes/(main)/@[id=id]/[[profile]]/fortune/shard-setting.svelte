<script lang="ts">
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { getShardLevel, getShardsForLevel, type FarmingAttributeShard } from 'farming-weight';

	interface Props {
		shard: FarmingAttributeShard;
		amount: number;
		onChange: (value: number) => void;
	}

	let { shard, amount, onChange }: Props = $props();

	let amt = $derived(amount);
	let level = $derived(getShardLevel(shard.rarity, amt));

	function selectChanged(newLevel?: number) {
		if (newLevel === undefined) return;

		const newAmt = getShardsForLevel(shard.rarity, newLevel);
		if (level === newLevel) {
			onChange(amt);
			return;
		}

		amt = newAmt;
		onChange(amt);
	}
</script>

<div class="flex flex-row items-center gap-2">
	<Select.Simple
		options={Array.from({ length: 11 }, (_, i) => ({ value: i, label: i == 0 ? 'None' : `Level ${i}` }))}
		value={level}
		change={selectChanged}
		class="w-24"
		placeholder="Level"
	/>
	<NumberInput
		class="my-1 h-10 max-w-16"
		type="text"
		inputmode="numeric"
		placeholder="0"
		bind:value={amt}
		onValueChange={() => onChange(amt)}
		min={0}
		max={96}
	/>
</div>
