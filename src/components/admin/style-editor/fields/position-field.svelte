<script lang="ts">
	import type { Position } from '$lib/styles/style';
	import { Label } from '$ui/label';
	import { NumberInput } from '$ui/number-input';

	interface Props {
		label: string;
		value: Position;
		onchange?: (value: Position) => void;
	}

	let { label, value = $bindable(), onchange }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	<Label class="inline-block text-xs first-letter:capitalize">{label}</Label>
	<div class="flex flex-row items-center gap-2">
		<div class="flex flex-row items-center gap-1">
			<span class="text-muted-foreground text-xs">x</span>
			<NumberInput
				class="h-8 w-20 font-mono text-xs"
				value={value.x}
				onValueChange={(v) => {
					value.x = v ?? 0;
					onchange?.(value);
				}}
			/>
		</div>
		<div class="flex flex-row items-center gap-1">
			<span class="text-muted-foreground text-xs">y</span>
			<NumberInput
				class="h-8 w-20 font-mono text-xs"
				value={value.y}
				onValueChange={(v) => {
					value.y = v ?? 0;
					onchange?.(value);
				}}
			/>
		</div>
	</div>
</div>
