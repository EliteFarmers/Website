<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import type { components } from '$lib/api/api';
	import { Avatar } from 'bits-ui';

	interface Props {
		account?: Partial<components['schemas']['AuthorizedAccountDto']>;
	}

	let { account = {} }: Props = $props();
</script>

<div class="bg-card relative isolate flex w-full flex-col overflow-clip rounded-lg border-2">
	<div class="relative">
		<Avatar.Root class="relative z-20 aspect-video size-full max-h-64 overflow-clip">
			<Avatar.Image
				class="pointer-events-none size-full object-cover select-none"
				src="https://cdn.discordapp.com/banners/{account.id}/{account.banner}.webp?size=1024&animated=true"
				alt="{account.username}'s Banner"
			/>
			<Avatar.Fallback class="bg-muted/20 size-full">
				{#snippet child({ props })}
					<div {...props}></div>
				{/snippet}
			</Avatar.Fallback>
		</Avatar.Root>
		<UserIcon
			user={account}
			size={512}
			class="bg-card pointer-events-none absolute bottom-0 left-4 z-30 size-44 translate-y-16 overflow-hidden rounded-full p-2 select-none"
		/>
	</div>
	<div class="relative mt-16 flex flex-row items-center gap-4 p-4">
		<div class="flex flex-col gap-1 break-all">
			<p class="text-2xl font-semibold">{account.displayName}</p>
			<span class="text-sm">{account.username}</span>
			<div class="flex flex-row items-center gap-1">
				<p class="text-muted-foreground text-sm">{account.id}</p>
				<CopyToClipboard
					text={account.id}
					size="sm"
					class="text-muted-foreground hover:text-foreground -my-2"
				/>
			</div>
		</div>
	</div>
</div>
