import type { AdminEventMemberDto, EventTeamWithMembersDto } from '$lib/api';
import { renderComponent, renderSnippet } from '$ui/data-table';
import Activity from '@lucide/svelte/icons/activity';
import CircleOff from '@lucide/svelte/icons/circle-off';
import LogOut from '@lucide/svelte/icons/log-out';
import Pause from '@lucide/svelte/icons/pause';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
import MemberRow from './member-row.svelte';
import MemberTableActions from './member-table-actions.svelte';
import MemberTeamRow from './member-team-row.svelte';

export type AdminEventMember = AdminEventMemberDto;
export type AdminEventTeam = EventTeamWithMembersDto;

const statusCellSnippet = createRawSnippet<[string]>((getStatus) => {
	const status = getStatus();
	const map = {
		0: '<span class="text-muted-foreground">Inactive</span>',
		1: '<span class="text-progress">Active</span>',
		2: '<span class="text-complete">Left</span>',
		3: '<span class="text-destructive">Banned</span>',
	};
	return {
		render: () => `<div class="font-medium">${map[+status as keyof typeof map] ?? 'Unknown'}</div>`,
	};
});

const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
	const amount = getAmount();
	return {
		render: () => `<div class="text-right font-medium">${amount}</div>`,
	};
});

export const getColumns = (
	teams: Record<number, EventTeamWithMembersDto>,
	actions: Record<string, (member: AdminEventMember) => void>
) =>
	[
		{
			id: 'playerName',
			accessorKey: 'playerName',
			header: 'Name',
			cell: ({ row }) => {
				return renderComponent(MemberRow, { member: row.original });
			},
		},
		{
			accessorKey: 'status',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<AdminEventMember, unknown>, {
					column,
					title: 'Status',
				}),
			cell: ({ row }) => {
				return renderSnippet(statusCellSnippet, row.getValue('status'));
			},
			filterFn: (row, id, value) => {
				return value.includes(row.original.status.toString());
			},
		},
		{
			accessorKey: 'teamId',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<AdminEventMember, unknown>, {
					column,
					title: 'Team',
				}),
			cell: ({ row }) => {
				const teamId = row.getValue('teamId');
				const team = teamId ? teams[teamId as number] : undefined;
				return renderComponent(MemberTeamRow, {
					member: row.original,
					team,
					actions,
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(row.original.teamId?.toString());
			},
			filterSelectOptions: Object.entries(teams).map(([key, team]) => ({
				value: key,
				label: team.name,
			})),
		},
		{
			accessorKey: 'score',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<AdminEventMember, unknown>, {
					column,
					title: 'Score',
					class: 'justify-end',
				}),
			cell: ({ row }) => {
				return renderSnippet(amountCellSnippet, parseFloat(row.getValue('score')).toLocaleString());
			},
			enableSorting: true,
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(MemberTableActions, { member: row.original, actions });
			},
		},
	] as ColumnDef<AdminEventMember>[];

export const statuses = [
	{
		value: '0',
		label: 'Inactive',
		icon: Pause,
	},
	{
		value: '1',
		label: 'Active',
		icon: Activity,
	},
	{
		value: '2',
		label: 'Left',
		icon: LogOut,
	},
	{
		value: '3',
		label: 'Banned',
		icon: CircleOff,
	},
];
