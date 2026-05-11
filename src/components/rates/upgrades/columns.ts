import type { RatesItemPriceData } from '$lib/api/elite';
import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import type { FortuneUpgrade, UpgradeRateImpact, UpgradeTreeNode } from 'farming-weight';
import DataTableColumnHeader from './data-table-column-header.svelte';
import UpgradeCompleteButton from './upgrade-complete-button.svelte';
import UpgradeCostPer from './upgrade-cost-per.svelte';
import UpgradeCost from './upgrade-cost.svelte';
import UpgradeFortune from './upgrade-fortune.svelte';
import UpgradeRateImpactCell from './upgrade-rate-impact.svelte';
import UpgradeTitle from './upgrade-title.svelte';

export const getColumns = (
	itemsLookup?: RatesItemPriceData,
	costFn?: (upgrade: FortuneUpgrade, items?: RatesItemPriceData) => number,
	applyUpgrade?: (upgrade: FortuneUpgrade) => void,
	expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode,
	rateImpactFn?: (upgrade: FortuneUpgrade) => UpgradeRateImpact | undefined,
	rateImpactUnavailableLabel?: string,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_version?: number
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
					toggleExpanded: row.toggleExpanded,
					expandUpgrade,
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
							});
						},
					} satisfies ColumnDef<FortuneUpgrade>,
				]
			: []),
		{
			accessorKey: 'costper',
			accessorFn: (row) => {
				if (costFn) {
					const increase = row.increase || row.max || 0;
					return increase > 0 ? Math.round(costFn(row, itemsLookup) / increase) : 0;
				}
				return 0;
			},
			cell: ({ row }) => {
				return renderComponent(UpgradeCostPer, {
					upgrade: row.original,
					totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
				});
			},
			enableSorting: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: 'Cost Per Fortune',
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

function getRateImpactCoinValue(impact: UpgradeRateImpact | undefined, itemsLookup?: RatesItemPriceData) {
	if (!impact) return 0;

	let total = impact.delta.npcCoins;
	for (const [itemId, amount] of Object.entries(impact.delta.rngItems ?? {})) {
		total += getItemSellValue(itemId, itemsLookup) * amount;
	}

	return total;
}

function getItemSellValue(itemId: string, itemsLookup?: RatesItemPriceData) {
	const item = itemsLookup?.[itemId];
	if (!item) return 0;

	const npc = item.bazaar?.npc || item.item?.npc_sell_price || 0;
	const bazaar = item.bazaar?.averageSellOrder || item.bazaar?.averageSell || 0;
	const auctionPrices = item.auctions
		?.map((auction) => (auction.lowest > 0 ? auction.lowest : auction.last))
		.filter((price) => price > 0);
	const auction = auctionPrices?.length ? Math.min(...auctionPrices) : 0;
	const marketValues = [bazaar, auction].filter((value) => value > 0);
	const market = marketValues.length ? Math.min(...marketValues) : 0;

	return Math.max(npc, market);
}
