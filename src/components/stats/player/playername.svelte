<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import { formatIgn } from '$lib/format';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Popover from '$ui/popover';

	interface Props {
		responsive?: boolean;
		bgClass?: string;
		bgStyle?: string;
		class?: string;
	}

	let { responsive = false, bgClass = 'border', bgStyle = '', class: classes = '' }: Props = $props();

	const ctx = getStatsContext();
	const ign = $derived(ctx.ignMeta);
	const rank = $derived(ctx.rank);
	const plus = $derived(rank?.plus ?? undefined);
	const plusColor = $derived(rank?.plusColor);
	const members = $derived((ctx.selectedProfile?.members ?? []).filter((m) => m.active && m.uuid !== ctx.account.id));
</script>

<Popover.Mobile hasContent={members.length > 0} triggerClass={responsive ? 'max-w-full min-w-0 text-left' : ''}>
	{#snippet trigger()}
		<div class={responsive ? 'max-w-full min-w-0' : `rounded-md p-1.5 px-3 ${bgClass}`} style={bgStyle}>
			<h1
				id={responsive ? undefined : 'playerName'}
				class={responsive
					? 'flex min-w-0 items-baseline gap-1 leading-none'
					: `font-emoji text-xl @sm:text-2xl @lg:text-2xl @xl:text-3xl ${classes} text-nowrap`}
			>
				{#if ctx.rank?.raw}
					<FormattedText text={ctx.rank.raw.replace(']', '').replace('[', '')} />
				{:else if rank && plus}
					<span style="color: {rank.color};">{rank?.tag}</span><span style="color: {plusColor};">{plus}</span>
				{:else if rank}
					<span style="color: {rank.color};">{rank?.tag}</span>
				{/if}
				<span class={responsive ? 'min-w-0 truncate' : undefined} title={responsive ? ign : undefined}
					>{ign}</span
				>
			</h1>
		</div>
	{/snippet}
	{#if members?.length}
		<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
			{#each members ?? [] as member, i (member.uuid ?? i)}
				<a
					href={`/@${member.uuid}/${ctx.selectedProfile?.profileId}`}
					class="flex justify-between gap-4 rounded-sm p-2 text-xl font-semibold hover:bg-muted"
				>
					<span class="font-emoji">{formatIgn(member.username, member.meta)}</span>
					<span class="font-normal">{member.farmingWeight?.toLocaleString()}</span>
				</a>
			{/each}
		</div>
	{/if}
</Popover.Mobile>
