<script lang="ts" generics="TData">
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Table } from '@tanstack/table-core';
	import type { WithoutChildren } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = HTMLAttributes<HTMLDivElement> & {
		table: Table<TData>;
	};

	let { table }: WithoutChildren<Props> = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="ml-auto">
				Columns <ChevronDown class="ml-2 size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column)}
			<DropdownMenu.CheckboxItem
				class="capitalize"
				bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
			>
				{column.id}
			</DropdownMenu.CheckboxItem>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
