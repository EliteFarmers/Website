<script lang="ts">
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Settings from 'lucide-svelte/icons/settings';

	interface Props {
		guild: components['schemas']['GuildMemberDto'] | components['schemas']['GuildDetailsDto'];
		link?: boolean;
	}

	let { guild, link = false }: Props = $props();
</script>

<div class="m-1 p-4 inline-block bg-primary-foreground rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex flex-shrink min-w-0 justify-start items-center gap-4">
			<GuildIcon {guild} />
			<h1 class="text-xl overflow-hidden whitespace-nowrap text-ellipsis pr-4">{guild.name}</h1>
		</div>
		<div class="flex justify-end min-w-0 items-center gap-4">
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
