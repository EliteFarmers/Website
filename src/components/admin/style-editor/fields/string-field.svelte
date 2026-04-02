<script lang="ts">
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';

	interface Props {
		label: string;
		value: string | undefined;
		placeholder?: string;
		onchange?: (value: string | undefined) => void;
	}

	let { label, value = $bindable(), placeholder = '', onchange }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	<Label class="inline-block text-xs first-letter:capitalize">{label}</Label>
	<Input
		class="h-8 text-xs"
		value={value ?? ''}
		{placeholder}
		oninput={(e) => {
			value = e.currentTarget.value || undefined;
			onchange?.(value);
		}}
	/>
</div>
