<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import UserIcon from '$comp/stats/discord/user-icon.svelte';
	import type { components } from '$lib/api/api';

	export let account: components['schemas']['AuthorizedAccountDto'] = {};
</script>

<div class="flex flex-col align-middle gap-4 bg-primary-foreground p-2 rounded-lg">
	<div class="flex flex-row items-center gap-4 p-2">
		<UserIcon user={account} />
		<div class="flex flex-col gap-1">
			<p class="text-2xl font-semibold">{account.username}</p>
			<div class="flex flex-row gap-1 items-center">
				<p class="text-md text-gray-500 font-semibold">{account.id}</p>
				<CopyToClipboard text={account.id} size="sm" class="-my-2" />
			</div>
		</div>
	</div>
</div>
