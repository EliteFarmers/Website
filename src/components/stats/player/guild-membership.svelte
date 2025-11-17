<script lang="ts">
	import GuildTag from '$comp/guilds/guild-tag.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();
	const guildMember = $derived(ctx.account.playerData?.guildMember);
</script>

{#if guildMember?.guild}
	<a
		class="relative flex max-w-fit flex-row items-center justify-between gap-2 rounded-md border px-3 py-2 text-lg md:py-2.5"
		href="/guilds/{guildMember.guild.id}"
	>
		<span class="font-semibold">{guildMember.guild.name}</span>
		{#if guildMember.guild.tag && guildMember.guild.tagColor}
			<GuildTag tag={guildMember.guild.tag} tagColor={guildMember.guild.tagColor} />
		{/if}
	</a>
{/if}
