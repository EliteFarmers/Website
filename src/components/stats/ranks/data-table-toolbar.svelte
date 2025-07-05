<script lang="ts" module>
	type TData = unknown;
</script>

<script lang="ts" generics="TData">
	import X from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import { categories, types } from './columns.js';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';

	let { table }: { table: Table<TData> } = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const filterCol = $derived(table.getColumn('interval'));
	const categoryCol = $derived(table.getColumn('category'));
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 flex-col items-start gap-2 sm:flex-row">
		<Input
			placeholder="Filter..."
			value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
			oninput={(e) => {
				table.getColumn('title')?.setFilterValue(e.currentTarget.value);
			}}
			onchange={(e) => {
				table.getColumn('title')?.setFilterValue(e.currentTarget.value);
			}}
			class="h-8 w-[150px]"
		/>

		<div class="flex flex-wrap items-center gap-2">
			{#if categoryCol}
				<DataTableFacetedFilter column={categoryCol} title="Category" options={categories} radio={false} />
			{/if}

			{#if filterCol}
				<DataTableFacetedFilter column={filterCol} title="Type" options={types} radio={true} />
			{/if}

			{#if isFiltered}
				<Button variant="outline" onclick={() => table.resetColumnFilters()} class="h-8 px-2 lg:px-3">
					Reset
					<X />
				</Button>
			{/if}
		</div>
	</div>
</div>
