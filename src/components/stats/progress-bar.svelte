<script lang="ts">
	export let hovering = false;
	export let percent = 0;
	export let readable = '';
	export let expanded: string | undefined = undefined;
	export let maxed = false;
	export let compact = false;
	export let barBg = 'bg-card';

	let className = (compact ? 'text-sm sm:text-md' : 'sm:text-lg') + 'leading-none font-semibold';
	export { className as class };
</script>

<div class="flex flex-1 flex-row items-center w-full">
	<div
		class="relative block w-full {compact ? 'h-5 rounded-md' : 'h-6 md:my-1 rounded-lg'} {barBg}"
		on:mouseenter={() => (hovering = true)}
		on:mouseleave={() => (hovering = false)}
		role="none"
	>
		<div
			class="absolute {compact ? 'h-5 rounded-md' : 'h-6 rounded-lg'} {maxed
				? 'bg-yellow-400 dark:bg-yellow-600'
				: 'bg-green-400 dark:bg-green-600'}"
			style={`width: ${Math.min(percent, 100)}%`}
		/>
		<div class="absolute flex items-center justify-center w-full h-full">
			<p class={className}>{hovering && expanded ? expanded : readable}</p>
		</div>
	</div>
</div>
