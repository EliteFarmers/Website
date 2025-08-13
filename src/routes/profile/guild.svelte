<script lang="ts">
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import type { GuildDetailsDto, GuildMemberDto } from '$lib/api';
	import { Button } from '$ui/button';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Settings from '@lucide/svelte/icons/settings';

	interface Props {
		guild: GuildMemberDto | GuildDetailsDto;
		link?: boolean;
	}

	let { guild, link = false }: Props = $props();
</script>

<div class="bg-card m-1 inline-block rounded-md p-4">
	<div class="flex items-center justify-between">
		<div class="flex min-w-0 shrink items-center justify-start gap-4">
			<GuildIcon {guild} />
			<h1 class="overflow-hidden pr-4 text-xl text-ellipsis whitespace-nowrap">{guild.name}</h1>
		</div>
		<div class="flex min-w-0 items-center justify-end gap-4">
			{#if link}
				<Button href="/server/{guild.id}" class="m-1" variant="ghost">
					<ExternalLink />
				</Button>
			{:else if 'hasBot' in guild && guild.hasBot}
				<Button href="/guild/{guild.id}" variant="ghost" class="m-1">
					<Settings />
				</Button>
			{:else}
				<Button href="/invite?guild_id=${guild.id}" variant="outline" class="m-1">
					<p>Invite</p>
				</Button>
			{/if}
		</div>
	</div>
</div>
