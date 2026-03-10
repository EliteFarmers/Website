<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import Content from './content.svelte';
	import NoProfiles from './no-profiles.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	type ProfileData = Awaited<LayoutData['profileData']>;

	function isNoProfiles(
		data: ProfileData | LayoutData['ssrProfileData'] | undefined
	): data is ProfileData & { noProfiles: true } {
		return !!data && 'noProfiles' in data && data.noProfiles === true;
	}

	function isError(
		data: ProfileData | LayoutData['ssrProfileData'] | undefined
	): data is { code: number; error: string } {
		return !!data && 'code' in data && 'error' in data;
	}
</script>

{#if data.ssrProfileData}
	{#if isNoProfiles(data.ssrProfileData)}
		<NoProfiles account={data.ssrProfileData.account} />
	{:else if isError(data.ssrProfileData)}
		{@render profileError(data.ssrProfileData)}
	{:else}
		<Content
			data={data.ssrProfileData as Exclude<typeof data.ssrProfileData, { code: number; error: string }>}
			ssrMemberData={data.ssrMemberData}
			ssrRanksData={data.ssrRanksData}
		>
			{@render children?.()}
		</Content>
	{/if}
{:else}
	{#await data.profileData}
		<div
			class="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4"
			in:fade={{ delay: 300 }}
		>
			<LoaderCircle class="text-muted-foreground size-32 animate-spin" />
			<p class="font-semibold">Loading data...</p>
		</div>
	{:then profile}
		{#if isNoProfiles(profile)}
			<NoProfiles account={profile.account} />
		{:else if isError(profile)}
			{@render profileError(profile)}
		{:else}
			<Content data={profile as Exclude<typeof profile, { code: number; error: string }>}>
				{@render children?.()}
			</Content>
		{/if}
	{/await}
{/if}

{#snippet profileError(profile: { code: number; error: string })}
	<h1 class="m-16 p-16 text-center font-mono text-6xl font-bold">{profile.code}</h1>
	<h4 class="font-lighter text-center text-2xl">{profile.error}</h4>
	<div class="item m-12 mb-32 flex flex-row justify-center gap-4 text-center">
		<a href="/" class="shadow-gray 0 bg-muted hover:bg-card rounded-md p-4 shadow-md">Return Home</a>
		<button onclick={() => location.reload()} class="shadow-gray bg-muted hover:bg-card rounded-md p-4 shadow-md"
			>Reload</button
		>
	</div>
{/snippet}
