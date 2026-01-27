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

	let background = $derived(fillClass ? fillClass : maxed ? 'bg-completed' : 'bg-progress');
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
			style="width: {Math.min(percent, 100)}%; opacity: {disabled ? 0.4 : 1};"
		></div>
		<div class="absolute flex h-full w-full items-center justify-center {disabled ? 'opacity-70' : ''}">
			<p class={className}>{hovering && expanded ? expanded : readable}</p>
		</div>
	</div>
</div>
