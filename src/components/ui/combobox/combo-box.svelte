<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import CaretSort from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$ui/command';
	import * as Popover from '$ui/popover';
	import { Button } from '$ui/button';
	import { cn } from '$lib/utils.js';

	interface Props {
		options: { label: string; value: string }[];
		exclude?: (string | undefined)[];
		placeholder: string;
		btnClass?: string;
		popoverClass?: string;
		onChange?: ((value: string) => void) | undefined;
		clear?: boolean;
		disabled?: boolean;
		value?: string;
	}

	let {
		options = [],
		exclude = [],
		placeholder,
		btnClass,
		popoverClass,
		onChange = undefined,
		clear = false,
		disabled = $bindable(false),
		value = $bindable('_'),
	}: Props = $props();

	let realOptions = clear
		? [{ label: placeholder, value: '_' }, ...options.filter((f) => !exclude.includes(f.value))]
		: options.filter((f) => !exclude.includes(f.value));

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	let selected = $derived(
		realOptions.find((f) => f.value.toString() === value.toString()) ?? { label: placeholder, value: '_' }
	);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				role="combobox"
				class={cn(
					`w-[200px] justify-between ${selected.value === '_' ? 'text-muted-foreground' : ''}`,
					btnClass
				)}
				aria-expanded={open}
				{disabled}
				{...props}
			>
				{selected.label}
				<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class={cn('max-h-48 w-[200px] overflow-y-scroll p-0', popoverClass)} side="bottom">
		<Command.Root>
			<Command.Input {placeholder} class="h-9" />
			<Command.Empty>No option found.</Command.Empty>
			<Command.Group>
				{#each realOptions as option}
					<Command.Item
						value={option.label}
						onSelect={() => {
							value = option.value;
							closeAndFocusTrigger();
							onChange?.(option.value);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== option.value && 'text-transparent')} />
						<span>{option.label}</span>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
