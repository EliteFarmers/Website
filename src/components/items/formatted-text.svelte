<script lang="ts" module>
	const MINECRAFT_FORMATTING_STYLE = {
		'§0': 'color: #000000;', // Black
		'§1': 'color: #0000AA;', // Dark Blue
		'§2': 'color: #00AA00;', // Dark Green
		'§3': 'color: #00AAAA;', // Dark Aqua
		'§4': 'color: #AA0000;', // Dark Red
		'§5': 'color: #AA00AA;', // Dark Purple
		'§6': 'color: #FFAA00;', // Gold
		'§7': 'color: #AAAAAA;', // Gray
		'§8': 'color: #555555;', // Dark Gray
		'§9': 'color: #5555FF;', // Blue
		'§a': 'color: #55FF55;', // Green
		'§b': 'color: #55FFFF;', // Aqua
		'§c': 'color: #FF5555;', // Red
		'§d': 'color: #FF55FF;', // Light Purple
		'§e': 'color: #FFFF55;', // Yellow
		'§f': 'color: #FFFFFF;', // White
		'§k': 'animation: obfuscated 1s infinite;',
		'§l': 'font-weight: bold;',
		'§m': 'text-decoration: line-through;',
		'§n': 'text-decoration: underline;',
		'§o': 'font-style: italic;',
		'§r': '',
	};
</script>

<script lang="ts">
	let { text }: { text: string } = $props();

	function parseMinecraftText(text: string): { text?: string; style?: string; isBr?: boolean }[] {
		if (text === '') return [{ isBr: true }];

		const parts = [] as { text: string; style: string }[];
		const regex = /(§[0-9a-fk-or])/gi;
		let activeStyles = [] as string[];

		// Prepend a reset code to handle text that doesn't start with a color code.
		const processedText = '§r' + text;

		processedText.split(regex).forEach((part) => {
			if (part.match(regex)) {
				// Color formatting code
				const code = part.toLowerCase();
				if (code === '§r') {
					activeStyles = [];
				} else {
					const style = MINECRAFT_FORMATTING_STYLE[code as keyof typeof MINECRAFT_FORMATTING_STYLE];
					if (style) {
						activeStyles.push(style);
					}
				}
			} else if (part) {
				// Regular text part
				parts.push({ text: part, style: activeStyles.join(' ') });
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
		{:else}
			<span style={part.style}>{part.text}</span>
		{/if}
	{/each}
{/if}

<style>
	@keyframes obfuscated {
		0% {
			transform: translateX(-2px);
		}
		50% {
			transform: translateX(2px);
		}
		100% {
			transform: translateX(-2px);
		}
	}
</style>
