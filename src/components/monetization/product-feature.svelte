<script lang="ts">
	import { PopoverMobile } from '$ui/popover';

	export let name: string | undefined = undefined;
</script>

<PopoverMobile>
	<div slot="trigger" class="flex flex-row gap-1 items-center rounded-sm p-2 bg-card">
		<slot name="icon" />
		{#if name}
			<p class="text-semibold text-sm leading-none">{name}</p>
		{/if}
	</div>
	<div>
		<slot />
	</div>
</PopoverMobile>
