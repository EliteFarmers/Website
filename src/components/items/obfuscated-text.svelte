<script lang="ts" module>
	const ObfuscatedAlphabet = `ABCDEFGHIJKLMNOPRSTUVWXYZabcdefhiklmnorstuvwxz0123456789!#^*-=+:".<>?`
		.split('')
		.sort(() => Math.random() - 0.5);
	const ObfuscatedTextCharacters = ObfuscatedAlphabet.join('\n');
	const ObfuscationSteps = ObfuscatedAlphabet.length;
	const ObfuscationDistance = ObfuscationSteps - 1;
	const ObfuscationDuration = 0.6;
</script>

<script lang="ts">
	let { text }: { text?: string } = $props();

	let length = $derived(text?.length ?? 0);
	const columns = $derived(Array.from({ length }, (_, index) => index));
	const randomDelays = $derived(Array.from({ length }, () => Math.random() * ObfuscationDuration));
</script>

{#if length > 0}
	<div
		class="relative my-auto mb-1 inline-flex overflow-hidden align-middle"
		style="height: 1em; line-height: 1;"
		aria-hidden="true"
	>
		{#each columns as column (column)}
			<span
				class="animate-obfuscated block"
				style:width="1ch"
				style:flex="0 0 1ch"
				style={`--obfuscated-steps: ${ObfuscationSteps}; --obfuscated-distance: ${ObfuscationDistance};`}
				style:animation-delay={`-${randomDelays[column]}s`}
				aria-hidden="true"
			>
				{ObfuscatedTextCharacters}
			</span>
		{/each}
	</div>
	<span class="sr-only">{text}</span>
{/if}
