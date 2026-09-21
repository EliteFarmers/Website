<script lang="ts">
	import type { Snippet } from 'svelte';
	import Discord from '../player/discord.svelte';
	import GuildMembership from '../player/guild-membership.svelte';
	import Profiles from '../player/profiles.svelte';
	import Skyblocklevel from '../player/skyblocklevel.svelte';
	import ExternalLinks from './external-links.svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div
	class="mx-auto my-4 flex w-fit max-w-full flex-wrap items-center justify-center gap-3 rounded-md bg-background p-1 text-foreground"
>
	{@render children?.()}
	<Profiles />
	<Skyblocklevel />
	<GuildMembership />
	<Discord />
	<ExternalLinks />
</div>
