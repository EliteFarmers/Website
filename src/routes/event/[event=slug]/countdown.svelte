<script lang="ts">
	import { getCountdownParts } from '$lib/format';
	import NumberFlow, { NumberFlowGroup } from '@number-flow/svelte';

	type Props = {
		ms: number;
	};

	let { ms }: Props = $props();

	let counter = $derived.by(() => getCountdownParts(ms));
</script>

<NumberFlowGroup>
	<div
		style="font-variant-numeric: tabular-nums; --number-flow-char-height: 0.85em"
		class="flex w-full flex-row items-center font-mono text-2xl font-semibold sm:text-4xl md:text-6xl lg:text-8xl"
	>
		<div
			class="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 {counter.days > 0
				? ''
				: 'text-muted'} border-r-2 px-1 md:px-2 lg:px-3"
		>
			<div class="-mb-2 mt-2 lg:-mb-4">
				<NumberFlow
					trend={-1}
					value={counter.days}
					digits={{ 1: { max: 5 } }}
					format={{ minimumIntegerDigits: 2 }}
				/>
			</div>
			<span class="text-sm font-normal text-muted-foreground">Days</span>
		</div>
		<div
			class="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 {counter.hours <= 0 &&
			counter.days <= 0
				? 'text-muted'
				: ''} border-r-2 px-1 md:px-2 lg:px-3"
		>
			<div class="-mb-2 mt-2 lg:-mb-4">
				<NumberFlow
					trend={-1}
					digits={{ 1: { max: 2 } }}
					value={counter.hours}
					format={{ minimumIntegerDigits: 2 }}
				/>
			</div>
			<span class="text-sm font-normal text-muted-foreground">Hours</span>
		</div>
		<div
			class="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 {counter.minutes <= 0 &&
			counter.hours <= 0 &&
			counter.days <= 0
				? 'text-muted'
				: ''} border-r-2 px-1 md:px-2 lg:px-3"
		>
			<div class="-mb-2 mt-2 lg:-mb-4">
				<NumberFlow
					trend={-1}
					value={counter.minutes}
					digits={{ 1: { max: 5 } }}
					format={{ minimumIntegerDigits: 2 }}
				/>
			</div>
			<span class="text-sm font-normal text-muted-foreground">Minutes</span>
		</div>
		<div
			class="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 {counter.seconds <= 0 &&
			counter.minutes <= 0 &&
			counter.hours <= 0 &&
			counter.days <= 0
				? 'text-muted'
				: ''} px-1 md:px-2 lg:px-3"
		>
			<div class="-mb-2 mt-2 lg:-mb-4">
				<NumberFlow
					trend={-1}
					value={counter.seconds}
					digits={{ 1: { max: 5 } }}
					format={{ minimumIntegerDigits: 2 }}
				/>
			</div>
			<span class="text-sm font-normal text-muted-foreground">Seconds</span>
		</div>
	</div>
</NumberFlowGroup>
