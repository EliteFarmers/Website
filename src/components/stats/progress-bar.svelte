<script lang="ts">
	interface Props {
		hovering?: boolean;
		percent?: number;
		readable?: string;
		expanded?: string | undefined;
		maxed?: boolean;
		compact?: boolean;
		barBg?: string;
		class?: string;
		fillClass?: string;
		disabled?: boolean;
	}

	let {
		hovering = $bindable(false),
		percent = 0,
		readable = '',
		expanded = undefined,
		maxed = false,
		compact = false,
		barBg = 'bg-background',
		disabled = false,
		fillClass = undefined,
		class: classNameProp = undefined,
	}: Props = $props();

	let className = $derived(
		classNameProp ?? (compact ? 'text-sm sm:text-md' : 'sm:text-lg') + 'leading-none font-semibold'
	);

	let background = $derived(
		fillClass
			? fillClass
			: !disabled
				? maxed
					? 'bg-completed'
					: 'bg-progress'
				: maxed
					? 'bg-completed/40'
					: 'bg-progress/40'
	);
</script>

<div class="flex w-full flex-1 flex-row items-center">
	<div
		class="relative block w-full {compact ? 'h-5 rounded-xs' : 'h-6 rounded-sm md:my-1'} {barBg}"
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		role="none"
	>
		<div
			class="absolute {compact ? 'h-5 rounded-xs' : 'h-6 rounded-sm'} {background}"
			style={`width: ${Math.min(percent, 100)}%`}
		></div>
		<div class="absolute flex h-full w-full items-center justify-center">
			<p class={className}>{hovering && expanded ? expanded : readable}</p>
		</div>
	</div>
</div>
