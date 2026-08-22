<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { Button } from 'bits-ui';
	import { createEventDispatcher } from 'svelte';
	const { PUBLIC_COMMUNITY_INVITE, PUBLIC_WEIGHT_REQ } = env;

	const dispatch = createEventDispatcher();

	function closeToast() {
		dispatch('closeToast');
		localStorage.setItem('join-elite-toast', '{"state": "closed"}');
	}
</script>

<div class="w-full space-y-4 rounded-lg border border-muted bg-background p-5 text-foreground select-none">
	<h3 class="text-xl font-bold">You qualify for Elite Farmer!</h3>
	<p>
		Join the <a href={PUBLIC_COMMUNITY_INVITE} target="_blank" class="text-link">Discord</a> and make a ticket to
		apply for the Elite Farmer Discord role and <a href="/info/badges" class="text-link">badge</a> for reaching
		<strong>{(+PUBLIC_WEIGHT_REQ).toLocaleString()}</strong> farming weight!
	</p>
	<span class="-mt-1 text-xs leading-none text-muted-foreground">Application not guaranteed to be accepted.</span>
	<Button.Root
		class="w-full rounded-md bg-muted py-2 transition-opacity duration-200 hover:opacity-70"
		onclick={closeToast}>Close</Button.Root
	>
</div>
