<script lang="ts">
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { SelectSimple } from '$ui/select';
	import type { Option } from '$ui/select/select-simple.svelte';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		label: string;
		value: string | undefined;
		options: Option<string>[];
		placeholder?: string;
		onchange?: (value: string | undefined) => void;
	}

	let { label, value = $bindable(), options, placeholder = 'Select...', onchange }: Props = $props();

	let selectValue = $derived(value ?? undefined);
</script>

<div class="flex flex-col gap-1">
	<Label class="inline-block text-xs first-letter:capitalize">{label}</Label>
	<div class="flex flex-row items-center gap-1">
		<SelectSimple
			value={selectValue}
			{options}
			{placeholder}
			change={(v) => {
				value = v || undefined;
				onchange?.(value);
			}}
			size="sm"
		/>
		{#if value != null}
			<Button
				variant="ghost"
				size="sm"
				class="h-7 w-7 shrink-0 p-0"
				onclick={() => {
					value = undefined;
					onchange?.(undefined);
				}}
			>
				<X size={12} />
			</Button>
		{/if}
	</div>
</div>
