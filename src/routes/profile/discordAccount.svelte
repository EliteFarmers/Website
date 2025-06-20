<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import type { components } from '$lib/api/api';

	interface Props {
		account?: Partial<components['schemas']['AuthorizedAccountDto']>;
	}

	let { account = {} }: Props = $props();
</script>

<div class="bg-card flex flex-col gap-4 rounded-lg p-2 align-middle">
	<div class="flex flex-row items-center gap-4 p-2">
		<UserIcon user={account} />
		<div class="flex flex-col gap-1">
			<p class="text-2xl font-semibold">{account.username}</p>
			<div class="flex flex-row items-center gap-1">
				<p class="text-muted-foreground text-sm">{account.id}</p>
				<CopyToClipboard text={account.id} size="sm" class="-my-2" />
			</div>
		</div>
	</div>
</div>
