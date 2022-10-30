<script lang="ts">
	import Tooltip from '$comp/generic/tooltip.svelte';

	export let username = 'Discord N/A';
	export let linked: boolean;
</script>

<div class="block max-w-fit p-2 px-3 m-1 rounded-md bg-gray-200 dark:bg-zinc-700">
	<div class="flex items-center gap-2">
		<h1 class="whitespace-nowrap text-base">{username}</h1>
		<div class="relative">
			{#if linked}
				<!-- Verified checkmark -->
				<svg class="mt-1 w-4 h-4 fill-current text-green-500" viewBox="0 0 20 20">
					<path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
				</svg>
			{:else}
				<!-- Unverified (x) -->
				<svg class="text-red-500" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
					<path
						d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
					/>
				</svg>
			{/if}
			<Tooltip>
				<p>
					{#if linked}
						Verified
					{:else}
						Not&nbsp;verified
					{/if}
				</p>
			</Tooltip>
		</div>
	</div>
</div>
