<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import { Button } from '$ui/button';
	import { Separator } from '$ui/separator';
</script>

<Head title="Guide Rules" description="Community guide writing rules and review guidelines." />

<main class="mx-auto my-12 flex max-w-3xl flex-col gap-8 px-4">
	<header class="flex flex-col gap-3">
		<h1 class="text-3xl font-bold">Guide Rules</h1>
		<p class="text-muted-foreground">
			These rules are used for manual review before guides are published or major updates are approved.
		</p>
	</header>

	<Separator />

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">What We Look For</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>Write original content with enough detail for another player to follow it.</li>
			<li>Use headings, images, callouts, and examples to make long guides scannable.</li>
			<li>Update outdated guides instead of publishing duplicates of the same advice.</li>
			<li>A guide should have a clear topic and title. Avoid vague topics like "SkyBlock Basics".</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Accuracy</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>Keep claims accurate, especially rates, prices, requirements, and patch-sensitive mechanics.</li>
			<li>Use the provided item price blocks for dynamic prices instead of writing static price claims.</li>
			<li>Make sure images, litematics, item embeds, and examples match the topic of the guide.</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Minimum Standards</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>Do not submit a shell of a guide that only links somewhere else.</li>
			<li>The guide should provide value even if every embedded video or external link is removed.</li>
			<li>
				Embedded videos are welcome, but the guide itself still needs useful supporting information, such as
				rates, setup requirements, speeds, angles, or written steps.
			</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Content</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>No harassment, foul language, explicit content, scams, or malware.</li>
			<li>
				No plagiarism. Credit outside sources when a guide depends on someone else's research, route, farm, or
				build.
			</li>
			<li>
				No misleading links, affiliate spam, or unrelated promotion. You may link to a relevant source, but
				external links will be reviewed for relevance and safety.
			</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Images and Files</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>Guide images must be uploaded or imported so they can be resized and rehosted.</li>
			<li>Do not upload private, copyrighted, or unrelated images.</li>
			<li>Litematic attachments must match the guide topic and pass validation before they can be used.</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Useful Editor Blocks</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>Use the credits block when a guide relies on another player's research, route, farm, or build.</li>
			<li>Use callouts for warnings, important corrections, or patch-sensitive notes.</li>
			<li>Use wiki links for Hypixel SkyBlock wiki references.</li>
		</ul>
	</section>

	<div class="flex flex-wrap gap-2">
		<a href="/guides">
			<Button variant="outline">Back to Guides</Button>
		</a>
		<a href="/info/guides">
			<Button variant="outline">Block Dictionary</Button>
		</a>
	</div>
</main>
