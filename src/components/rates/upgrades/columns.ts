import type { RatesItemPriceData } from '$lib/api/elite';
import { getRateImpactCoinValue } from '$lib/rates/upgrade-rate-value';
import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '$ui/data-table';
import type { FortuneUpgrade, UpgradeRateImpact, UpgradeTreeNode } from 'farming-weight';
import DataTableColumnHeader from './data-table-column-header.svelte';
import UpgradeCompleteButton from './upgrade-complete-button.svelte';
import UpgradeCostPer from './upgrade-cost-per.svelte';
import UpgradeCost from './upgrade-cost.svelte';
import UpgradeFortune from './upgrade-fortune.svelte';
import UpgradeRateImpactCell from './upgrade-rate-impact.svelte';
import UpgradeTitle from './upgrade-title.svelte';

type AnyUpgradeRateImpact = UpgradeRateImpact<unknown, unknown>;

export const getColumns = (
	itemsLookup?: RatesItemPriceData,
	costFn?: (upgrade: FortuneUpgrade, items?: RatesItemPriceData) => number,
	applyUpgrade?: (upgrade: FortuneUpgrade) => void,
	expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode,
	canExpandUpgrade?: (upgrade: FortuneUpgrade) => boolean,
	rateImpactFn?: (upgrade: FortuneUpgrade) => AnyUpgradeRateImpact | undefined,
	rateImpactUnavailableLabel?: string,
	_version?: number | string,
	costPerValueFn?: (upgrade: FortuneUpgrade) => number,
	costPerHeader = 'Cost Per Fortune',
	referenceOnlyPrices = false
) =>
	[
		{
			id: 'title',
			accessorKey: 'title',
			header: 'Upgrade',
			cell: ({ row }) => {
				return renderComponent(UpgradeTitle, {
					upgrade: row.original,
					items: itemsLookup,
					expanded: row.getIsExpanded(),
					toggleExpanded: () => row.toggleExpanded(),
					canExpand: !!expandUpgrade && (canExpandUpgrade?.(row.original) ?? false),
				});
			},
		},
		{
			id: 'increase',
			accessorKey: 'increase',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: 'Fortune',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(UpgradeFortune, { upgrade: row.original });
			},
		},
		...(rateImpactFn
			? [
					{
						id: 'rateImpact',
						header: ({ column }) =>
							renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
								column,
								title: 'Coins/hr',
							}),
						enableSorting: true,
						accessorFn: (row) => getRateImpactCoinValue(rateImpactFn(row), itemsLookup),
						cell: ({ row }) => {
							const impact = rateImpactFn(row.original);
							const coins = getRateImpactCoinValue(impact, itemsLookup);
							return renderComponent(UpgradeRateImpactCell, {
								impact,
								coins,
								totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
								items: itemsLookup,
								unavailableLabel: rateImpactUnavailableLabel,
								referenceOnlyPrices,
							});
						},
					} satisfies ColumnDef<FortuneUpgrade>,
				]
			: []),
		{
			accessorKey: 'costper',
			accessorFn: (row) => {
				if (costFn) {
					const value = costPerValueFn?.(row);
					const increase = (value ?? row.increase) || row.max || 0;
					return increase > 0 ? Math.round(costFn(row, itemsLookup) / increase) : Number.MAX_SAFE_INTEGER;
				}
				return 0;
			},
			cell: ({ row }) => {
				return renderComponent(UpgradeCostPer, {
					upgrade: row.original,
					totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
					value: costPerValueFn?.(row.original),
					referenceOnlyPrices,
				});
			},
			enableSorting: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: costPerHeader,
				}),
		},
		{
			accessorKey: 'cost',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: 'Cost',
					class: 'justify-end',
				}),
			cell: ({ row }) =>
				renderComponent(UpgradeCost, {
					upgrade: row.original,
					items: itemsLookup,
					totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
					referenceOnlyPrices,
				}),
			enableSorting: true,
			accessorFn: (row) => {
				if (costFn) {
					return costFn(row, itemsLookup);
				}
				return 0;
			},
		},
		{
			id: 'completed',
			header: '',
			cell: ({ row }) => {
				return renderComponent(UpgradeCompleteButton, { upgrade: row.original, applyUpgrade });
			},
			enableSorting: false,
			enableHiding: false,
		},
	] as ColumnDef<FortuneUpgrade>[];
