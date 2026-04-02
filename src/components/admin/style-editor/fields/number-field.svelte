<script lang="ts">
	import { Label } from '$ui/label';
	import { NumberInput } from '$ui/number-input';
	import { SliderSimple } from '$ui/slider';

	interface Props {
		label: string;
		value: number | undefined;
		min?: number;
		max?: number;
		step?: number;
		slider?: boolean;
		onchange?: (value: number | undefined) => void;
	}

	let { label, value = $bindable(), min, max, step = 1, slider = false, onchange }: Props = $props();

	let sliderValue = $derived(value ?? min ?? 0);
</script>

<div class="flex flex-col gap-1">
	<Label class="inline-block text-xs first-letter:capitalize">{label}</Label>
	<div class="flex flex-row items-center gap-2">
		<NumberInput
			class="h-8 w-24 font-mono text-xs"
			{value}
			{min}
			{max}
			{step}
			onValueChange={(v) => {
				value = v;
				onchange?.(v);
			}}
		/>
		{#if slider && min != null && max != null}
			<SliderSimple
				class="w-32"
				value={sliderValue}
				onValueChange={(v) => {
					value = v;
					onchange?.(value);
				}}
				{min}
				{max}
				{step}
			/>
		{/if}
	</div>
</div>
