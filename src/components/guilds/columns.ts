import type { HypixelGuildDetailsDto } from '$lib/api';
import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import GuildCatacombsXp from './columns/guild-catacombs-xp.svelte';
import GuildFarmingWeight from './columns/guild-farming-weight.svelte';
import GuildMemberCount from './columns/guild-member-count.svelte';
import GuildName from './columns/guild-name.svelte';
import GuildSkillLevel from './columns/guild-skill-level.svelte';
import GuildSkyblockXp from './columns/guild-skyblock-xp.svelte';
import GuildSlayerXp from './columns/guild-slayer-xp.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';

export const getColumns = () =>
	[
		{
			id: 'title',
			accessorKey: 'title',
			header: 'Guild',
			cell: ({ row, table }) => {
				const rankCalculator = table.options.meta as
					| { getRankNumber?: (rowIndex: number) => number }
					| undefined;
				const rank = rankCalculator?.getRankNumber?.(row.index) ?? row.index + 1;
				return renderComponent(GuildName, { guild: row.original, rank });
			},
		},
		{
			id: 'Member Count',
			accessorKey: 'memberCount',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Members',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildMemberCount, { guild: row.original });
			},
		},
		{
			id: 'Skyblock Level',
			accessorKey: 'stats.skyblockExperience.average',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Skyblock Level',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildSkyblockXp, { guild: row.original });
			},
		},
		{
			id: 'Farming Weight',
			accessorKey: 'stats.farmingWeight.total',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Farming Weight',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildFarmingWeight, { guild: row.original });
			},
		},
		{
			id: 'Skill Level',
			accessorKey: 'stats.skillLevel.average',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Skill Level',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildSkillLevel, { guild: row.original });
			},
		},
		{
			id: 'Catacombs Level',
			accessorKey: 'stats.catacombsExperience.average',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Catacombs Level',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildCatacombsXp, { guild: row.original });
			},
		},
		{
			id: 'Slayer Xp',
			accessorKey: 'stats.slayer.total',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Slayer Xp',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildSlayerXp, { guild: row.original });
			},
		},
	] as ColumnDef<HypixelGuildDetailsDto>[];
