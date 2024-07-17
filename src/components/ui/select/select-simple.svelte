<!-- Credit: https://github.com/huntabyte/bits-ui/issues/235#issue-2042475148 -->

<script lang="ts" context="module">
	export type Option<T = string | number> = {
		value: T;
		label: string;
		color?: string;
	};
</script>

<script lang="ts">
	import { Select as Primitive } from 'bits-ui';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import * as Select from '.';

	type T = $$Generic<string | number>;

	type $$Props = HTMLButtonAttributes & {
		open?: boolean;
		disabled?: boolean;
		required?: boolean;
		id?: string;
		name?: string;
		value?: T | null;
		placeholder?: string;
		options: Option<T>[];
		change?: (value: T) => void;
	};

	export let open = false;
	export let disabled = false;
	export let required = false;

	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;

	export let options: Option<T>[];
	export let value: T | null | undefined = undefined;
	export let placeholder = 'Select option';
	export let change: (value: T) => void = () => undefined;

	$: selected = value != null ? options.find((x) => x.value === value) : undefined;
	$: display = selected ? selected.label : placeholder;

	function onChange(option: unknown) {
		let o = option as Option<T>;
		if (o) {
			value = o.value;
			change?.(value);
		}
	}
</script>

<Primitive.Root loop bind:open {disabled} {required} {name} {selected} onSelectedChange={onChange}>
	<Select.Trigger {id} {...$$restProps}>
		<Select.Value placeholder={display} class={(!value && 'text-muted-foreground') || ''} />
	</Select.Trigger>

	<Select.Input />

	<Select.Content class="p-0 w-[400px] max-h-96 overflow-y-auto overscroll-y-contain">
		{#each options as o (o.value)}
			<Select.Item value={o.value}>
				<div class="flex flex-row gap-1 items-center">
					{#if o.color}
						<div class="w-4 h-4 rounded-sm" style="background-color: {o.color}" />
					{/if}
					<span>{o.label}</span>
				</div>
			</Select.Item>
		{/each}
	</Select.Content>
</Primitive.Root>
