<script lang="ts">
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { SelectSimple } from '$ui/select';
	import type { Option } from '$ui/select/select-simple.svelte';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		label: string;
		value: string | undefined;
		imageRefs: Record<string, { url?: string }>;
		onchange?: (value: string | undefined) => void;
	}

	let { label, value = $bindable(), imageRefs, onchange }: Props = $props();

	let options = $derived<Option<string>[]>(
		Object.entries(imageRefs).map(([key]) => ({
			value: key,
			label: key,
		}))
	);

	let selectValue = $derived(value ?? undefined);
</script>

<div class="flex flex-col gap-1">
	<Label class="inline-block text-xs first-letter:capitalize">{label}</Label>
	<div class="flex flex-row items-center gap-1">
		<SelectSimple
			value={selectValue}
			{options}
			placeholder="Select image ref..."
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
	{#if value}
		{@const url = imageRefs[value]?.url}
		{#if url}
			<img src={url} alt={value} class="mt-1 h-12 w-12 rounded border object-cover" />
		{/if}
	{/if}
</div>
