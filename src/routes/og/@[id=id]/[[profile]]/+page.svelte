<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const description = data.description;
	const profile = data.profile;
</script>

<Head
	title="{data.account.formattedName} ({profile?.profileName}) | Farming Weight"
	description={data.description}
	imageUrl="https://api.elitebot.dev/account/{data.account.id}/face.png"
	canonicalPath="/@{data.account.name}/{encodeURIComponent(profile?.profileName ?? '')}"
/>

<h1>{data.account.formattedName} ({profile?.profileName})</h1>

<p>
	{#each description.split('\n') as line, i (i)}
		{line}<br />
	{/each}
</p>
