<script lang="ts">
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';

	interface Props {
		label: string;
		value: string | undefined;
		onchange?: (value: string | undefined) => void;
	}

	let { label, value = $bindable(), onchange }: Props = $props();

	function handleColorInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onchange?.(value);
	}

	function handleTextInput(val: string) {
		value = val || undefined;
		onchange?.(value);
	}
</script>

<div class="flex flex-col gap-1">
	<Label class="inline-block text-xs first-letter:capitalize">{label}</Label>
	<div class="flex flex-row items-center gap-2">
		<input
			type="color"
			value={value ?? '#000000'}
			oninput={handleColorInput}
			class="h-9 w-9 shrink-0 cursor-pointer rounded border p-0.5"
		/>
		<Input
			class="h-8 font-mono text-xs"
			value={value ?? ''}
			placeholder="#000000"
			oninput={(e) => handleTextInput(e.currentTarget.value)}
		/>
	</div>
</div>
