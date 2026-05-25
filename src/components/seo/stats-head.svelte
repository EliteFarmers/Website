<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import Head, { type Props } from './head.svelte';

	const ctx = getStatsContext();

	let { title, description, ...rest }: Props = $props();
</script>

<Head
	title="{ctx.ignMeta} | {title || 'Stats'}"
	description={description || 'View detailed statistics for your SkyBlock profile.'}
	imageUrl="https://skins.mcstats.com/bust/{ctx.uuid}"
	noindex={ctx.hideFromIndex}
	{...rest}
></Head>
