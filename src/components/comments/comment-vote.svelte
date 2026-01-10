<script lang="ts">
	import { Button } from '$ui/button';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';

	interface Props {
		score: number;
		userVote?: number | null;
		onVoteUp?: () => void;
		onVoteDown?: () => void;
		disabled?: boolean;
	}

	let { score = 0, userVote = null, onVoteUp, onVoteDown, disabled = false }: Props = $props();

	let isUpvoted = $derived(userVote === 1);
	let isDownvoted = $derived(userVote === -1);
</script>

<div class="flex flex-row items-center gap-0.5">
	<Button
		variant="ghost"
		size="sm"
		onclick={onVoteUp}
		{disabled}
		class={`h-6 w-6 p-0 hover:bg-transparent ${isUpvoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
	>
		<ArrowUp size={16} />
	</Button>

	<span
		class="min-w-6 text-center text-xs font-semibold tabular-nums"
		class:text-primary={isUpvoted}
		class:text-destructive={isDownvoted}
		class:text-muted-foreground={!isUpvoted && !isDownvoted}
	>
		{score.toLocaleString()}
	</span>

	<Button
		variant="ghost"
		size="sm"
		onclick={onVoteDown}
		{disabled}
		class={`h-6 w-6 p-0 hover:bg-transparent ${isDownvoted ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
	>
		<ArrowDown size={16} />
	</Button>
</div>
