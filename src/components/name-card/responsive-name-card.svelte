<script lang="ts">
	import type { FrameStyleLayerDto, ImageAttachmentDto } from '$lib/api';
	import type { Snippet } from 'svelte';
	import FormattedText from '$comp/items/formatted-text.svelte';
	import Artwork from './artwork.svelte';
	import FittedText from './fitted-text.svelte';
	import { nameCardLayout, rankText, textStyle, weightText, type Card } from './layout';

	let {
		card,
		ign,
		uuid,
		prefix = '',
		weight = 0,
		rank,
		imageRefs = {},
		frame,
		frameImageRefs = imageRefs,
		nameContent,
		rankContent,
		artworkOverlay,
	}: {
		card: Card;
		ign: string;
		uuid: string;
		prefix?: string;
		weight?: number;
		rank?: number;
		imageRefs?: Record<string, ImageAttachmentDto>;
		frame?: FrameStyleLayerDto | null;
		frameImageRefs?: Record<string, ImageAttachmentDto>;
		nameContent?: Snippet;
		rankContent?: Snippet;
		artworkOverlay?: Snippet;
	} = $props();
	const layout = $derived(nameCardLayout(card));
	const hasAvatar = $derived(layout.preset !== 'centered' && !!card.elements.avatar);
	const frameImage = $derived(frame?.imageUrl ? frameImageRefs[frame.imageUrl] : undefined);
</script>

<div
	class="name-card"
	data-preset={layout.preset}
	data-alignment={layout.alignment}
	data-spacing={layout.spacing}
	style="--name-scale:{layout.nameScale};--rank-scale:{layout.rankScale};--weight-scale:{layout.weightScale};--label-scale:{layout.labelScale};--avatar-scale:{layout.avatarScale};"
>
	<div class="banner">
		<div class="surface dark">
			<Artwork {card} {imageRefs} />
			<div
				class="content"
				class:mirrored={layout.preset === 'mirrored'}
				class:centered={layout.preset === 'centered'}
			>
				{#if hasAvatar}
					<div class="avatar" style:opacity={card.elements.avatar?.opacity ?? 1}>
						<img
							class="body-avatar"
							src={card.elements.avatar?.mode === 'head'
								? `https://mc-heads.net/avatar/${uuid || 'MHF_Steve'}/256`
								: `https://skins.mcstats.com/body/front/${uuid || 'MHF_Steve'}`}
							alt="Player avatar"
						/>
						<img
							class="head-avatar"
							src="https://mc-heads.net/avatar/{uuid || 'MHF_Steve'}/256"
							alt="Player avatar"
						/>
					</div>
				{/if}
				<div class="details">
					<div class="identity desktop-identity">{@render identity(false)}</div>
					{#if card.elements.weight}<div class="weight" style={textStyle(card.elements.weight)}>
							<FittedText
								text={weightText(weight)}
								appearance={`${layout.weightScale}:${textStyle(card.elements.weight)}`}
							/>
						</div>{/if}
					{#if card.elements.label}<div class="label" style={textStyle(card.elements.label)}>
							Farming Weight
						</div>{/if}
				</div>
			</div>
		</div>
		{#if frame?.imageUrl}
			<picture
				class="frame"
				style:opacity={frame.opacity ?? 1}
				style:transform="scaleX({1 + ((frame.scale ?? 1) - 1) / 4.8}) scaleY({frame.scale ?? 1})"
			>
				{#if frameImage?.posterUrl}<source
						media="(prefers-reduced-motion: reduce)"
						srcset={frameImage.posterUrl}
					/>{/if}
				<img src={frameImage?.url ?? frame.imageUrl} alt="" />
			</picture>
		{/if}
		{@render artworkOverlay?.()}
	</div>
	<div class="identity mobile-identity">{@render identity(true)}</div>
</div>

{#snippet identity(compact: boolean)}
	{#if card.elements.name}<div class="player-name" style={compact ? undefined : textStyle(card.elements.name)}>
			{#if nameContent}{@render nameContent()}{:else}<span class="plain-name" title={ign}
					>{#if prefix}<span class="prefix"><FormattedText text={prefix} /></span>{/if}<span class="username"
						>{ign}</span
					></span
				>{/if}
		</div>{/if}
	{#if card.elements.rank && rankText(rank)}<div
			class="rank"
			style={compact ? undefined : textStyle(card.elements.rank)}
		>
			{#if rankContent}{@render rankContent()}{:else}{rankText(rank)}{/if}
		</div>{/if}
{/snippet}

<style>
	.name-card {
		container: namecard / inline-size;
		width: 100%;
		min-width: 0;
		--gap: 1.2cqw;
	}
	.banner {
		position: relative;
		aspect-ratio: 4.8;
		width: 100%;
	}
	.surface {
		position: absolute;
		inset: 0;
		border: 2px solid var(--border);
		border-radius: var(--radius);
		background: var(--background);
		color: var(--foreground);
		overflow: clip;
	}
	.content {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		gap: var(--gap);
		padding: 1.5cqw 3cqw;
	}
	.content.mirrored {
		flex-direction: row-reverse;
	}
	.content.centered {
		text-align: center;
	}
	.avatar {
		flex: 0 0 calc(12cqw * var(--avatar-scale));
		height: 100%;
		min-width: 0;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.head-avatar {
		display: none;
	}
	.details {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: calc(var(--gap) / 2);
		min-width: 0;
		height: 100%;
		justify-content: center;
	}
	.identity {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.4em;
		min-width: 0;
		line-height: 1;
	}
	.desktop-identity {
		flex-wrap: nowrap;
	}
	.player-name {
		min-width: 0;
		max-width: 100%;
		font-size: calc(clamp(18px, 2.9cqw, 30px) * var(--name-scale));
	}
	.plain-name {
		display: flex;
		align-items: baseline;
		gap: 0.25em;
		min-width: 0;
	}
	.prefix {
		flex-shrink: 0;
	}
	.username {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rank {
		flex-shrink: 0;
		font-size: calc(clamp(18px, 2.9cqw, 30px) * var(--rank-scale));
		white-space: nowrap;
	}
	.weight {
		flex: 0 1 auto;
		height: calc(1em + 2 * var(--text-padding, 0px));
		min-height: 0;
		font-size: calc(clamp(32px, 8.8cqw, 96px) * var(--weight-scale));
		font-weight: 600;
		line-height: 1;
		min-width: 0;
	}
	.label {
		flex-shrink: 0;
		font-size: calc(clamp(12px, 1.37cqw, 14px) * var(--label-scale));
		line-height: 1;
	}
	.frame {
		position: absolute;
		/* The frame editor positions overlays inside the surface's 2px border. */
		inset: 2px;
		pointer-events: none;
		transform-origin: center;
	}
	.frame img {
		width: 100%;
		height: 100%;
	}
	.mobile-identity {
		display: none;
	}
	[data-spacing='compact'] {
		--gap: 0.7cqw;
	}
	[data-spacing='relaxed'] {
		--gap: 1.8cqw;
	}
	[data-alignment='center'] .details,
	.centered .details {
		text-align: center;
	}
	[data-alignment='center'] .identity,
	.centered .identity {
		flex-shrink: 0;
		justify-content: center;
	}
	[data-alignment='end'] .details {
		text-align: right;
	}
	[data-alignment='end'] .identity {
		flex-shrink: 0;
		justify-content: flex-end;
	}
	@container namecard (width < 768px) {
		.label {
			display: none;
		}
	}
	@container namecard (width < 512px) {
		.desktop-identity {
			display: none;
		}
		.mobile-identity {
			display: flex;
			justify-content: center;
			gap: 0.75rem;
			margin-top: 1rem;
			color: var(--foreground);
		}
		.mobile-identity .player-name,
		.mobile-identity .rank {
			font-size: 1.25rem;
		}
		.avatar {
			flex-basis: calc(12cqw * var(--avatar-scale));
		}
		.body-avatar {
			display: none;
		}
		.head-avatar {
			display: block;
		}
		.content {
			padding: 2cqw 3cqw;
			gap: 3cqw;
		}
	}
</style>
