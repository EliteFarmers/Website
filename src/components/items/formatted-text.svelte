<script lang="ts" module>
	const MINECRAFT_FORMATTING_STYLE = {
		'§0': 'text-[#000000]', // Black
		'§1': 'text-[#0000AA]', // Dark Blue
		'§2': 'text-[#00AA00]', // Dark Green
		'§3': 'text-[#00AAAA]', // Dark Aqua
		'§4': 'text-[#AA0000]', // Dark Red
		'§5': 'text-[#AA00AA]', // Dark Purple
		'§6': 'text-[#FFAA00]', // Gold
		'§7': 'text-[#AAAAAA]', // Gray
		'§8': 'text-[#555555]', // Dark Gray
		'§9': 'text-[#5555FF]', // Blue
		'§a': 'text-[#55FF55]', // Green
		'§b': 'text-[#55FFFF]', // Aqua
		'§c': 'text-[#FF5555]', // Red
		'§d': 'text-[#FF55FF]', // Light Purple
		'§e': 'text-[#FFFF55]', // Yellow
		'§f': 'text-[#FFFFFF]', // White
		'§k': 'animate-obfuscated',
		'§l': 'font-bold',
		'§m': 'line-through',
		'§n': 'underline',
		'§o': 'italic',
		'§r': '',
	};
</script>

<script lang="ts">
	import ObfuscatedText from './obfuscated-text.svelte';

	let { text }: { text: string } = $props();

	function parseMinecraftText(text: string): { text?: string; style?: string; isBr?: boolean }[] {
		if (text === '') return [{ isBr: true }];

		const parts = [] as { text: string; style: string }[];
		const regex = /(§[0-9a-fk-or])/gi;
		let activeStyles = [] as string[];
		let transientStyles = [] as string[];

		// Prepend a reset code to handle text that doesn't start with a color code.
		const processedText = '§r' + text;

		processedText.split(regex).forEach((part) => {
			if (part.match(regex)) {
				// Color formatting or style code
				const code = part.toLowerCase();
				if (code === '§r') {
					activeStyles = [];
					transientStyles = [];
				} else {
					const style = MINECRAFT_FORMATTING_STYLE[code as keyof typeof MINECRAFT_FORMATTING_STYLE];
					if (style) {
						if (/^§[0-9a-f]$/.test(code)) {
							activeStyles = [style];
							transientStyles = [];
						} else {
							transientStyles = [style];
						}
					}
				}
			} else if (part) {
				// Regular text part
				parts.push({ text: part, style: [...activeStyles, ...transientStyles].join(' ') });
				transientStyles = [];
			}
		});

		return parts;
	}

	const formattedParts = $derived(parseMinecraftText(text));
</script>

{#if text}
	{#each formattedParts as part, i (i)}
		{#if part.isBr}
			<br />
		{:else if part.style?.includes('animate-obfuscated')}
			<span class={part.style}>
				<ObfuscatedText text={part.text} />
			</span>
		{:else}
			<span class={part.style}>{part.text}</span>
		{/if}
	{/each}
{/if}
