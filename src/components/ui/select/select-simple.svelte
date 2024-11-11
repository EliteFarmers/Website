<!-- Credit: https://github.com/huntabyte/bits-ui/issues/235#issue-2042475148 -->

<script lang="ts" module>
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



	interface Props {
		open?: boolean;
		disabled?: boolean;
		required?: boolean;
		id?: string | undefined;
		name?: string | undefined;
		options: Option<T>[];
		value?: T | null | undefined;
		placeholder?: string;
		change?: (value: T) => void;
		[key: string]: any
	}

	let {
		open = $bindable(false),
		disabled = false,
		required = false,
		id = undefined,
		name = undefined,
		options,
		value = $bindable(undefined),
		placeholder = 'Select option',
		change = () => undefined,
		...rest
	}: Props = $props();

	let selected = $derived(value != null ? options.find((x) => x.value === value) : undefined);
	let display = $derived(selected ? selected.label : placeholder);

	function onChange(option: unknown) {
		let o = option as Option<T>;
		if (o) {
			value = o.value;
			change?.(value);
		}
	}
</script>

<Primitive.Root loop bind:open {disabled} {required} {name} {selected} onSelectedChange={onChange}>
	<Select.Trigger {id} {...rest}>
		<Select.Value placeholder={display} class={(!value && 'text-muted-foreground') || ''} />
	</Select.Trigger>

	<Select.Input />

	<Select.Content class="p-0 w-[400px] max-h-96 overflow-y-auto overscroll-y-contain">
		{#each options as o (o.value)}
			<Select.Item value={o.value}>
				<div class="flex flex-row gap-1 items-center">
					{#if o.color}
						<div class="w-4 h-4 rounded-sm" style="background-color: {o.color}"></div>
					{/if}
					<span>{o.label}</span>
				</div>
			</Select.Item>
		{/each}
	</Select.Content>
</Primitive.Root>
