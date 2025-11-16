import type { HypixelGuildDetailsDto } from '$lib/api';
import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import GuildMemberCount from './columns/guild-member-count.svelte';
import GuildName from './columns/guild-name.svelte';
import GuildSkyblockXp from './columns/guild-skyblock-xp.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';

export const getColumns = () =>
	[
		{
			id: 'title',
			accessorKey: 'title',
			header: 'Upgrade',
			cell: ({ row }) => {
				return renderComponent(GuildName, { guild: row.original });
			},
		},
		{
			id: 'memberCount',
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
			id: 'stats.skyblockExperience.average',
			accessorKey: 'stats.skyblockExperience.average',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<HypixelGuildDetailsDto, unknown>, {
					column,
					title: 'Skyblock Experience',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(GuildSkyblockXp, { guild: row.original });
			},
		},
	] as ColumnDef<HypixelGuildDetailsDto>[];
