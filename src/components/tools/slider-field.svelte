<script lang="ts">
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { SliderSimple } from '$ui/slider';

	let {
		id,
		label,
		value = $bindable(0),
		min = 0,
		max,
		step = 1,
		allowNone = false,
		description,
	}: {
		id: string;
		label: string;
		value: number;
		min?: number;
		max: number;
		step?: number;
		/** Adds a zero-valued None stop before a positive minimum. */
		allowNone?: boolean;
		description?: string;
	} = $props();

	const sliderMin = $derived(allowNone ? min - step : min);

	function updateValue(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const next = input.valueAsNumber;
		value =
			allowNone && (!Number.isFinite(next) || next <= 0)
				? 0
				: Number.isFinite(next)
					? Math.min(max, Math.max(min, Math.round((next - min) / step) * step + min))
					: min;
		input.value = allowNone && value === 0 ? '' : String(value);
	}
</script>

<div class="min-w-0 space-y-2">
	<Label for={id}>{label}</Label>
	<div class="flex items-center gap-3">
		<div class="min-w-0 flex-1 px-2.5">
			<SliderSimple
				bind:value={
					() => (allowNone && value === 0 ? sliderMin : value),
					(next) => (value = allowNone && next < min ? 0 : next)
				}
				min={sliderMin}
				{max}
				{step}
				aria-label={label}
				aria-valuetext={allowNone ? (value === 0 ? 'None' : String(value)) : undefined}
				class="ml-0 h-9"
			/>
		</div>
		<Input
			{id}
			type="number"
			value={allowNone && value === 0 ? undefined : value}
			min={allowNone ? 0 : min}
			placeholder={allowNone ? 'None' : undefined}
			aria-valuetext={allowNone && value === 0 ? 'None' : undefined}
			{max}
			{step}
			oninput={(event) => {
				const next = event.currentTarget.valueAsNumber;
				if (allowNone && next === 0) value = 0;
				else if (Number.isFinite(next) && next >= min && next <= max) value = next;
			}}
			onkeydown={(event) => {
				if (!allowNone) return;
				if (event.key === 'ArrowUp' && value === 0) {
					event.preventDefault();
					value = min;
				} else if (event.key === 'ArrowDown' && value <= min) {
					event.preventDefault();
					value = 0;
				}
			}}
			onchange={updateValue}
			class="w-16 shrink-0 [appearance:textfield] text-center tabular-nums [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
		/>
	</div>
	{#if description}<p class="text-xs text-muted-foreground">{description}</p>{/if}
</div>
