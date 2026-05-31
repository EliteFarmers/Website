<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import { Button } from '$ui/button';
	import { Separator } from '$ui/separator';
</script>

<Head title="Guide Rules" description="Community guide writing rules and review guidelines." />

<main class="mx-auto my-12 flex max-w-3xl flex-col gap-8 px-4">
	<div class="flex flex-col gap-3">
		<h1 class="text-3xl font-bold">Guide Rules</h1>
		<p class="text-muted-foreground">
			These rules are used for manual review before guides are published or major updates are approved.
		</p>
	</div>

	<Separator />

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Quality</h2>
		<ul class="text-muted-foreground list-disc space-y-2 pl-5">
			<li>Write original content with enough detail for another player to follow it.</li>
			<li>Keep claims accurate, especially rates, prices, requirements, and patch-sensitive mechanics.</li>
			<li>Use headings, images, callouts, and examples to make long guides scannable.</li>
			<li>Update outdated guides instead of publishing duplicates of the same advice.</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Content</h2>
		<ul class="text-muted-foreground list-disc space-y-2 pl-5">
			<li>No harassment, slurs, explicit content, scams, malware, or instructions for banable automation.</li>
			<li>No plagiarism. Credit outside sources when a guide depends on someone else's research or build.</li>
			<li>No misleading links, affiliate spam, or unrelated promotion.</li>
			<li>Corrections from comments may be hoisted into guides when they clarify important issues.</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Images and Files</h2>
		<ul class="text-muted-foreground list-disc space-y-2 pl-5">
			<li>Guide images must be uploaded or imported through Elite so they can be resized and rehosted.</li>
			<li>Do not upload private, copyrighted, or unrelated images.</li>
			<li>Litematic attachments must match the guide topic and pass validation before they can be used.</li>
		</ul>
	</section>

	<div>
		<a href="/guides">
			<Button variant="outline">Back to Guides</Button>
		</a>
	</div>
</main>
