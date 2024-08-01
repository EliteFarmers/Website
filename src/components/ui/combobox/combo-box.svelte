<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import CaretSort from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$ui/command';
	import * as Popover from '$ui/popover';
	import { Button } from '$ui/button';
	import { cn } from '$lib/utils.js';

	export let options = [] as { label: string; value: string }[];
	export let exclude = [] as (string | undefined)[];
	export let placeholder = 'Select...';
	export let btnClass = '';
	export let onChange: ((value: string) => void) | undefined = undefined;
	export let clear = false;
	export let disabled = false;

	$: realOptions = clear
		? [{ label: placeholder, value: '_' }, ...options.filter((f) => !exclude.includes(f.value))]
		: options.filter((f) => !exclude.includes(f.value));

	let open = false;
	export let value = '';

	$: selected = realOptions.find((f) => f.value === value) ?? { label: placeholder, value: '_' };

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			{disabled}
			class={cn(`w-[200px] justify-between ${selected.value === '_' ? 'text-muted-foreground' : ''}`, btnClass)}
		>
			{selected.label}
			<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0 max-h-96 overflow-y-scroll">
		<Command.Root>
			<Command.Input {placeholder} class="h-9" />
			<Command.Empty>No option found.</Command.Empty>
			<Command.Group>
				{#each realOptions as option}
					<Command.Item
						value={option.value}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger);
							onChange?.(currentValue);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== option.value && 'text-transparent')} />
						{option.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
