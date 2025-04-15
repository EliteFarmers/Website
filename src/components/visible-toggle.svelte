<script lang="ts">
	import Button, { type ButtonProps } from '$ui/button/button.svelte';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	interface Props extends ButtonProps {
		visible: boolean;
	}
	let { visible = $bindable(false), ...rest }: Props = $props();
</script>

<Button
	class="h-8 w-8"
	variant="ghost"
	onclick={() => (visible = !visible)}
	aria-label={visible ? 'Hide' : 'Show'}
	{...rest}
>
	{#if visible}
		<Eye class="h-4 w-4" />
	{:else}
		<EyeOff class="h-4 w-4" />
	{/if}
</Button>
