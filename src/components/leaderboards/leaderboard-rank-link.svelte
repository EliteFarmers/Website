<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAnchorAttributes, 'href' | 'onclick' | 'onclickcapture'> & {
		category: string;
		player?: string | undefined;
		profile?: string | undefined;
		rank: number;
		children: Snippet;
	};

	let { category, player, profile, rank, children, ...rest }: Props = $props();

	const fallbackHref = $derived(`/leaderboard/${category}/${Math.max(rank - 10, 1)}`);
	const resolverHref = $derived(
		player ? `/leaderboard/${category}/${player}-${profile ?? ''}?fallback=${rank}` : fallbackHref
	);

	function resolveCurrentRank(event: MouseEvent) {
		if (!player || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		event.preventDefault();
		void goto(resolverHref);
	}
</script>

<a href={fallbackHref} {...rest} data-sveltekit-preload-data="off" onclickcapture={resolveCurrentRank}>
	{@render children()}
</a>
