<script lang="ts">
	import { Label } from '$ui/label';
	import Switch from '$ui/switch/switch.svelte';

	interface Props {
		label: string;
		value: boolean | undefined;
		onchange?: (value: boolean | undefined) => void;
	}

	let { label, value = $bindable(), onchange }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2">
	<Switch
		checked={value ?? false}
		onCheckedChange={(v) => {
			value = v;
			onchange?.(value);
		}}
	/>
	<Label class="text-xs leading-none first-letter:capitalize">{label}</Label>
</div>
