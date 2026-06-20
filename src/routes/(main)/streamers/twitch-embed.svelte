<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		channel: string;
		title?: string;
		class?: string;
		frame?: boolean;
	}

	let { channel, title = `${channel} Twitch stream`, class: className = '', frame = true }: Props = $props();

	const parent = $derived(page.url.hostname);
	const src = $derived(
		`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&muted=true&autoplay=true`
	);
	const frameClass = $derived(frame ? 'rounded-md border' : '');
</script>

<iframe
	{src}
	{title}
	allowfullscreen
	allow="autoplay; fullscreen"
	class="aspect-video min-h-75 w-full bg-black {frameClass} {className}"
></iframe>
