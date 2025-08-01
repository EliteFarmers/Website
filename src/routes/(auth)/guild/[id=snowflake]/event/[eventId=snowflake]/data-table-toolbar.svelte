<script lang="ts" module>
	type TData = unknown;
</script>

<script lang="ts" generics="TData">
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import X from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import { statuses } from './columns.js';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';

	let { table }: { table: Table<TData> } = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const statusCol = $derived(table.getColumn('status'));
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Filter users..."
			value={(table.getColumn('playerName')?.getFilterValue() as string) ?? ''}
			oninput={(e) => {
				table.getColumn('playerName')?.setFilterValue(e.currentTarget.value);
			}}
			onchange={(e) => {
				table.getColumn('playerName')?.setFilterValue(e.currentTarget.value);
			}}
			class="h-8 w-[150px] lg:w-[250px]"
		/>

		{#if statusCol}
			<DataTableFacetedFilter column={statusCol} title="Status" options={statuses} />
		{/if}

		{#if isFiltered}
			<Button variant="ghost" onclick={() => table.resetColumnFilters()} class="h-8 px-2 lg:px-3">
				Reset
				<X />
			</Button>
		{/if}
	</div>
</div>
