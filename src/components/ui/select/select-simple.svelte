<!-- Credit: https://github.com/huntabyte/bits-ui/issues/235#issue-2042475148 -->

<script lang="ts" module>
	export type T = string | number;
	export type Extra = Record<string, unknown>;

	export type Option<T = string | number, Extra = unknown> = {
		value: T;
		label: string;
		color?: string;
	} & Extra;
</script>

<script lang="ts" generics="T extends string | number, Extra extends object">
	import { Select as Primitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import * as Select from '.';

	interface Props extends Primitive.TriggerProps {
		open?: boolean;
		disabled?: boolean;
		required?: boolean;
		id?: string | undefined;
		name?: string | undefined;
		options: Option<T, Extra>[];
		option?: Snippet<[Option<T, Extra>]>;
		value?: T | null | undefined;
		placeholder?: string;
		change?: (value?: T) => void;
		size?: 'sm' | 'default';
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
		option,
		...rest
	}: Props = $props();

	let selected = $derived(value != null ? options.find((x) => x.value.toString() === value?.toString()) : undefined);
</script>

<Primitive.Root
	type="single"
	bind:open
	{disabled}
	{required}
	{name}
	onValueChange={() => change(value || undefined)}
	bind:value={value as string | undefined}
>
	<Select.Trigger {id} {...rest}>
		{#if selected}
			{@render item(selected)}
		{:else}
			<span>{placeholder}</span>
		{/if}
	</Select.Trigger>
	<Select.Content class="max-h-96 overflow-y-auto overscroll-y-contain p-0">
		{#each options as o (o.value)}
			<Select.Item value={o.value.toString()}>
				{#if option}
					{@render option(o)}
				{:else}
					{@render item(o)}
				{/if}
			</Select.Item>
		{/each}
	</Select.Content>
</Primitive.Root>

{#snippet item(option: Option<T>)}
	<div class="flex flex-row items-center gap-1">
		{#if option.color}
			<div class="h-4 w-4 rounded-sm" style="background-color: {option.color}"></div>
		{/if}
		<span>{option.label}</span>
	</div>
{/snippet}
