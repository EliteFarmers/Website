<script lang="ts">
	import type { WeightStyleWithDataDto } from '$lib/api';

	interface Props {
		style: WeightStyleWithDataDto;
		ign: string;
	}

	let { style, ign }: Props = $props();

	const pageTheme = $derived(style.page);
	const pageBackground = $derived(pageTheme?.background);
	const pageBackgroundImage = $derived(
		pageBackground?.imageUrl ? style.imageRefs?.[pageBackground.imageUrl] : undefined
	);
	const pageThemeCss = $derived(
		Object.entries(pageTheme?.properties ?? {})
			.filter(([property]) => /^--[a-zA-Z0-9_-]+$|^[a-zA-Z][a-zA-Z0-9-]*$/.test(property))
			.map(([property, value]) => `${property}:${value}`)
			.join(';')
	);
	const backgroundSrcset = $derived.by(() => {
		if (!pageBackgroundImage) return undefined;
		return Object.values(pageBackgroundImage.posterSources ?? pageBackgroundImage.sources)
			.map((source) => `${source.url} ${source.width}w`)
			.join(', ');
	});
</script>

<div class="relative isolate aspect-video w-full overflow-clip rounded-lg border bg-background contain-[paint]">
	{#if pageBackground?.imageUrl}
		<img
			src={pageBackgroundImage?.posterUrl ?? pageBackgroundImage?.url ?? pageBackground.imageUrl}
			srcset={backgroundSrcset}
			sizes="(max-width: 768px) 100vw, 768px"
			alt=""
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 -z-10 h-full w-full"
			style="object-fit: {pageBackground.fit}; object-position: {pageBackground.position}; opacity: {pageBackground.opacity};"
		/>
	{/if}

	<div class="profile-theme relative z-0 flex h-full flex-col gap-3 p-4 sm:p-6" style={pageThemeCss}>
		<div class="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground sm:text-xs">
			<span>Profiles</span><span>/</span><span class="font-medium text-foreground">{ign}</span>
		</div>

		<div class="flex items-center gap-3 rounded-lg border border-border bg-card/90 p-3 shadow-sm sm:gap-4 sm:p-4">
			<div class="size-10 shrink-0 rounded-md bg-muted sm:size-14"></div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold sm:text-lg">{ign}</p>
				<p class="text-[0.65rem] text-muted-foreground sm:text-xs">Farming Weight · 12,345</p>
			</div>
			<div class="rounded-md bg-primary/15 px-2 py-1 text-[0.65rem] font-semibold text-primary sm:text-xs">
				#3,113
			</div>
		</div>

		<div class="flex w-fit rounded-md border border-border bg-background/85 p-1 text-[0.6rem] sm:text-xs">
			<span class="rounded-sm bg-muted px-2 py-1 font-medium">Stats</span>
			<span class="px-2 py-1 text-muted-foreground">Garden</span>
			<span class="px-2 py-1 text-muted-foreground">Fortune</span>
		</div>

		<div class="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3">
			<div class="rounded-lg border border-border bg-card/90 p-3 shadow-sm">
				<p class="text-[0.65rem] font-semibold sm:text-xs">Profile</p>
				<div class="mt-2 space-y-1.5">
					<div class="h-2 w-4/5 rounded-full bg-muted"></div>
					<div class="h-2 w-3/5 rounded-full bg-muted"></div>
				</div>
			</div>
			<div class="rounded-lg border border-border bg-card/90 p-3 shadow-sm">
				<p class="text-[0.65rem] font-semibold sm:text-xs">Recent activity</p>
				<div class="mt-2 space-y-1.5">
					<div class="h-2 w-2/3 rounded-full bg-primary/25"></div>
					<div class="h-2 w-5/6 rounded-full bg-muted"></div>
				</div>
			</div>
		</div>
	</div>
</div>
