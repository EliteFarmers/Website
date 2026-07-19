<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/seo/head.svelte';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Guild from '../guild.svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let refreshing = $state(false);
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="my-16 flex flex-col gap-16 lg:flex-row">
	<section class="flex w-full max-w-3xl flex-col gap-y-16">
		{#if data.refreshWarning || form?.refreshError || form?.refreshSuccess}
			<Alert.Root
				variant={data.reconnectDiscord || form?.reconnect || form?.refreshError ? 'destructive' : 'default'}
			>
				<Alert.Title>{form?.refreshSuccess ? 'Permissions refreshed' : 'Discord refresh issue'}</Alert.Title>
				<Alert.Description class="flex flex-col items-start gap-3">
					<p>{form?.refreshSuccess ?? form?.refreshError ?? data.refreshWarning}</p>
					{#if data.reconnectDiscord || form?.reconnect}
						<Button href="/login?redirect=/profile/servers" variant="outline">Reconnect Discord</Button>
					{:else if !form?.refreshSuccess}
						<form
							action="?/refreshGuilds"
							method="POST"
							use:enhance={() => {
								refreshing = true;
								return async ({ update }) => {
									await update();
									refreshing = false;
								};
							}}
						>
							<Button type="submit" variant="outline" disabled={refreshing}>
								<RotateCw size={16} class={refreshing ? 'animate-spin' : undefined} />
								{refreshing ? 'Refreshing…' : 'Retry'}
							</Button>
						</form>
					{/if}
				</Alert.Description>
			</Alert.Root>
		{/if}

		<section class="rounded-lg border-2 p-4">
			<h1 class="mb-4 text-2xl">Manage Servers</h1>
			{#if data.adminGuilds.length === 0}
				<p>You don't manage any servers with the bot invited!</p>
			{/if}
			<div class="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
				{#each data.adminGuilds as guild (guild.id)}
					<Guild {guild} />
				{/each}
			</div>
		</section>

		<section class="rounded-lg border-2 p-4">
			<h1 class="mb-4 text-3xl">Public Servers</h1>
			{#if data.publicGuilds.length === 0}
				<p>You're not a member of any public guilds!</p>
			{/if}
			<div class="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
				{#each data.publicGuilds as guild (guild.id)}
					<Guild {guild} link={true} />
				{/each}
			</div>
		</section>

		<section class="rounded-lg border-2 p-4">
			<h1 class="mb-4 text-2xl">Other Servers</h1>
			<p>Missing a server above? <a href="/invite" class="text-link underline">Invite the bot!</a></p>
		</section>
	</section>
</div>
