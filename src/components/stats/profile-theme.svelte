<script lang="ts">
	import type { PageStyleDataDto, WeightStyleWithDataDto } from '$lib/api';
	import { pageBaseTheme, pageThemeCss } from '$lib/styles/page-theme';
	import { cn } from '$lib/utils';
	import { BitsConfig, Portal } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let {
		theme,
		imageRefs,
		class: className,
		portals = false,
		fixedBackground = false,
		children,
	}: {
		theme?: PageStyleDataDto | null;
		imageRefs?: WeightStyleWithDataDto['imageRefs'];
		class?: string;
		portals?: boolean;
		fixedBackground?: boolean;
		children: Snippet;
	} = $props();

	let portalTarget = $state<HTMLDivElement>();
	const baseTheme = $derived(pageBaseTheme(theme?.baseTheme));
	const background = $derived(theme?.background);
	const image = $derived(background?.imageUrl ? imageRefs?.[background.imageUrl] : undefined);
	// Static images have an empty posterSources map; only prefer it when a poster exists.
	const sources = $derived(image?.posterUrl ? image.posterSources : image?.sources);
</script>

<!-- Keep overlays outside the page's stacking/clipping context while retaining its theme. -->
{#if portals && theme}
	<Portal to="body">
		<div
			{@attach (element) => {
				portalTarget = element;
				return () => {
					portalTarget = undefined;
				};
			}}
			class={cn('profile-theme contents bg-background text-foreground', baseTheme)}
			data-page-base-theme={baseTheme}
			style={pageThemeCss(theme.properties, true)}
		></div>
	</Portal>
{/if}

<BitsConfig defaultPortalTo={portals && theme ? portalTarget : undefined}>
	<div
		class={cn(
			'profile-theme relative isolate flow-root w-full overflow-clip',
			theme && 'bg-background text-foreground',
			baseTheme,
			className
		)}
		data-page-base-theme={baseTheme}
		style={pageThemeCss(theme?.properties)}
	>
		{#if background?.imageUrl}
			<div class="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]" aria-hidden="true">
				<!-- Clip the viewport-fixed background to the profile; previews stay inside their cards. -->
				<div class={fixedBackground ? 'fixed inset-0' : 'absolute inset-0'}>
					<img
						src={image?.posterUrl ?? image?.url ?? background.imageUrl}
						srcset={sources
							? Object.values(sources)
									.map((source) => `${source.url} ${source.width}w`)
									.join(', ')
							: undefined}
						sizes="100vw"
						alt=""
						class="h-full w-full"
						style:object-fit={background.fit ?? 'cover'}
						style:object-position={background.position ?? 'center'}
						style:opacity={background.opacity ?? 1}
					/>
				</div>
			</div>
		{/if}
		{@render children()}
	</div>
</BitsConfig>
