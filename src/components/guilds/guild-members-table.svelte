<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import type { HypixelGuildDto, HypixelGuildMemberDto } from '$lib/api';
	import * as Table from '$ui/table/index.js';

	interface Props {
		guild: HypixelGuildDto;
	}

	let { guild }: Props = $props();

	const defaultRankName = $derived.by(() => guild.ranks?.find((rank) => rank.default)?.name ?? 'Member');

	function resolveRank(member: HypixelGuildMemberDto) {
		if (!member.rank) return defaultRankName;
		const match = guild.ranks?.find((rank) => rank.name === member.rank);
		return match?.name ?? member.rank;
	}

	function getJoinedAt(member: HypixelGuildMemberDto) {
		const value = member.joinedAt ?? 0n;
		if (typeof value === 'bigint') return Number(value);
		return Number(value ?? 0);
	}

	function getWeeklyExp(member: HypixelGuildMemberDto) {
		return Object.values(member.expHistory ?? {}).reduce((total, value) => total + Number(value ?? 0), 0);
	}

	const RECENT_ACTIVITY_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

	function isRecentlyActive(member: HypixelGuildMemberDto) {
		const lastRecorded = Object.entries(member.expHistory ?? {}).reduce((latest, [date, value]) => {
			if (!value) return latest;
			const timestamp = Date.parse(date);
			return Number.isNaN(timestamp) ? latest : Math.max(latest, timestamp);
		}, 0);
		return lastRecorded > 0 && Date.now() - lastRecorded <= RECENT_ACTIVITY_THRESHOLD_MS;
	}

	const sortedMembers = $derived.by((): HypixelGuildMemberDto[] => {
		const members = [...(guild.members ?? [])];
		return members.sort((a, b) => getWeeklyExp(b) - getWeeklyExp(a));
	});
</script>

<div class="overflow-x-auto">
	<Table.Root class="w-full border-separate border-spacing-x-0 border-spacing-y-2">
		<Table.Header>
			<Table.Row>
				<Table.Head
					class="bg-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase first:rounded-l-md last:rounded-r-md"
				>
					Member
				</Table.Head>
				<Table.Head class="bg-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
					Rank
				</Table.Head>
				<Table.Head class="bg-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
					Joined
				</Table.Head>
				<Table.Head class="bg-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
					Weekly GEXP
				</Table.Head>
				<Table.Head class="bg-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
					Status
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if sortedMembers.length}
				{#each sortedMembers as member (member.playerUuid)}
					<Table.Row>
						<Table.Cell class="bg-card px-4 py-3 align-middle text-sm first:rounded-l-md">
							<div class="flex items-center gap-3">
								<PlayerHead uuid={member.playerUuid} size="md" />
								<div class="flex flex-col gap-1">
									<a
										href="/@{encodeURIComponent(member.name)}"
										class="text-foreground font-semibold hover:underline"
									>
										{member.formattedName}
									</a>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell class="bg-card px-4 py-3 align-middle text-sm">
							{resolveRank(member)}
						</Table.Cell>
						<Table.Cell class="bg-card px-4 py-3 align-middle text-sm">
							{#if getJoinedAt(member)}
								<DateDisplay timestamp={getJoinedAt(member)} />
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="bg-card px-4 py-3 align-middle text-sm font-semibold">
							{getWeeklyExp(member).toLocaleString()}
						</Table.Cell>
						<Table.Cell class="bg-card px-4 py-3 align-middle text-sm last:rounded-r-md">
							<span class="flex items-center gap-2">
								<span
									class={`size-2 rounded-full ${isRecentlyActive(member) ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
								></span>
								<span>{isRecentlyActive(member) ? 'Active' : 'Inactive'}</span>
							</span>
						</Table.Cell>
					</Table.Row>
				{/each}
			{:else}
				<Table.Row>
					<Table.Cell colspan={5} class="bg-card text-muted-foreground px-4 py-10 text-center text-sm">
						No members found.
					</Table.Cell>
				</Table.Row>
			{/if}
		</Table.Body>
	</Table.Root>
</div>
