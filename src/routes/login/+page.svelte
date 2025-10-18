<script lang="ts">
	import { goto } from '$app/navigation';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	const ctx = getGlobalContext();

	let { data }: PageProps = $props();

	onMount(async () => {
		ctx.user = data.user;
		goto(data.redirect ?? '/');
	});
</script>
