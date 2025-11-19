<script lang="ts">
	import GuildMembersTable from '$comp/guilds/guild-members-table.svelte';
	import Head from '$comp/head.svelte';
	import type { HypixelGuildDto } from '$lib/api';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const guild = $derived.by(() => data.guild as HypixelGuildDto);

	const description = $derived.by((): string => {
		const memberCount = guild.memberCount.toLocaleString();
		const tag = guild.tag ? ` [${guild.tag}]` : '';
		return `${guild.name}${tag} guild overview on Elite. Browse ${memberCount} members and key guild statistics.`;
	});

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([{ name: 'Guilds', href: '/guilds' }, { name: guild.name }]);
	});
</script>

<Head title={`${guild.name} Guild Overview`} {description} />

<section class="flex flex-col gap-6">
	<div class="flex flex-col gap-2">
		<h2 class="text-2xl font-semibold">Members</h2>
		<p class="text-muted-foreground text-sm">
			Sorted by weekly guild experience. Select the "Member Leaderboards" tab to view guild standings across
			leaderboards.
		</p>
	</div>
	<GuildMembersTable {guild} />
</section>
