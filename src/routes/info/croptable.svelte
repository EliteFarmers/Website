<script lang="ts">
	import { CROPS_PER_ONE_WEIGHT as crops } from '$lib/constants/weights';
</script>

<table class="w-full">
	<thead>
		<tr class="bg-gray-200 dark:bg-zinc-700">
			<th class="text-left">Crop</th>
			<th class="text-left">Collection Required Per 1 Weight</th>
			<th class="text-left">Base Drops Per Break</th>
		</tr>
	</thead>
	<tbody>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Cactus</td>
			<td>{crops['cactus'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>2</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Carrot</td>
			<td>{crops['carrot'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>3</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Cocoa Beans</td>
			<td>{crops['cocoa'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>3</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Melon</td>
			<td>{crops['melon'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>5</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Mushroom</td>
			<td
				>{crops['mushroom'].toLocaleString(undefined, { maximumFractionDigits: 0 })} - {(
					crops['mushroom'] * 2
				).toLocaleString(undefined, { maximumFractionDigits: 0 })}*</td
			>
			<td>1</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Nether Wart</td>
			<td>{crops['netherwart'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>2.5</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Potato</td>
			<td>{crops['potato'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>3</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Pumpkin</td>
			<td>{crops['pumpkin'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>1</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Sugar Cane</td>
			<td>{crops['sugarcane'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>2</td>
		</tr>
		<tr class="bg-gray-100 dark:bg-zinc-800">
			<td>Wheat</td>
			<td>{crops['wheat'].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
			<td>1</td>
		</tr>
	</tbody>
</table>

<style lang="postcss">
	td,
	th {
		@apply p-1 px-2;
	}

	tbody > tr:nth-child(odd) {
		@apply bg-opacity-50;
	}
</style>
