<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import type { AuthorizedAccountDto } from '$lib/api';
	import { Avatar } from 'bits-ui';

	interface Props {
		account?: Partial<AuthorizedAccountDto>;
	}

	let { account = {} }: Props = $props();
</script>

<div class="relative isolate flex w-full flex-col overflow-clip rounded-lg border-2 bg-card">
	<div class="relative">
		<Avatar.Root class="relative z-20 aspect-video size-full max-h-64 overflow-clip">
			{#if account.banner}
				<Avatar.Image
					class="pointer-events-none size-full object-cover select-none"
					src="https://cdn.discordapp.com/banners/{account.id}/{account.banner}.webp?size=1024&animated=true"
					alt="{account.username}'s Banner"
				/>
			{/if}
			<Avatar.Fallback class="size-full bg-muted/20">
				{#snippet child({ props })}
					<div {...props}></div>
				{/snippet}
			</Avatar.Fallback>
		</Avatar.Root>
		<UserIcon
			user={account}
			size={512}
			class="pointer-events-none absolute bottom-0 left-4 z-30 size-32 translate-y-16 overflow-hidden rounded-full bg-card select-none"
		/>
	</div>
	<div class="relative mt-16 flex flex-row items-center gap-4 p-4">
		<div class="flex flex-col gap-1 break-all">
			<p class="text-2xl font-semibold">{account.displayName}</p>
			<span class="text-sm">{account.username}</span>
			<div class="flex flex-row items-center gap-1">
				<p class="text-sm text-muted-foreground">{account.id}</p>
				<CopyToClipboard
					text={account.id}
					size="sm"
					class="-my-2 text-muted-foreground hover:text-foreground"
				/>
			</div>
		</div>
	</div>
</div>
