<script lang="ts">
	import { cn } from '$lib/utils';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Command from '$ui/command';
	import * as Popover from '$ui/popover';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		options: { label: string; value: string }[];
		placeholder?: string;
		value?: string[];
		disabled?: boolean;
		class?: string;
	}

	let {
		options = [],
		placeholder = 'Select items...',
		value = $bindable([]),
		disabled = false,
		class: className,
	}: Props = $props();

	let open = $state(false);
	let inputValue = $state('');

	function handleSelect(currentValue: string) {
		if (value.includes(currentValue)) {
			value = value.filter((v) => v !== currentValue);
		} else {
			value = [...value, currentValue];
		}
	}

	function remove(v: string) {
		value = value.filter((i) => i !== v);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn('h-auto min-h-10 w-full justify-between', className)}
				{...props}
				{disabled}
			>
				<div class="flex flex-wrap gap-1">
					{#if value.length > 0}
						{#each value as v, i (i)}
							{@const option = options.find((o) => o.value === v)}
							<Badge variant="secondary" class="mr-1">
								{option?.label ?? v}
								<button
									class="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											remove(v);
										}
									}}
									onmousedown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onclick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										remove(v);
									}}
								>
									<X class="text-muted-foreground hover:text-foreground h-3 w-3" />
								</button>
							</Badge>
						{/each}
					{:else}
						<span class="text-muted-foreground">{placeholder}</span>
					{/if}
				</div>
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-full p-0">
		<Command.Root>
			<Command.Input placeholder="Search..." bind:value={inputValue} />
			<Command.Empty>No item found.</Command.Empty>
			<Command.Group class="max-h-64 overflow-auto">
				{#each options as option, i (i)}
					<Command.Item value={option.label} onSelect={() => handleSelect(option.value)}>
						<Check class={cn('mr-2 h-4 w-4', value.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
						{option.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
