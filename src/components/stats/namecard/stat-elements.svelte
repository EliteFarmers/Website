<script lang="ts">
	import Profiles from '../player/profiles.svelte';
	import Skyblocklevel from '../player/skyblocklevel.svelte';
	import Discord from '../player/discord.svelte';
	import ExternalLinks from './external-links.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="my-4 flex flex-wrap items-center justify-center gap-3">
	{@render children?.()}
	<Profiles />
	<Skyblocklevel />
	<Discord />
	<ExternalLinks />
</div>
