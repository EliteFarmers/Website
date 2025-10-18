<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import { acceptConfirmationForm } from '$lib/remote/confirmations.remote';
	import { Button } from '$ui/button';
	import { ScrollArea } from '$ui/scroll-area';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let confirmation = $derived(data.confirmation);
	let id = $derived(+data.id);

	function addLinkTarget(node: HTMLElement) {
		const links = node.querySelectorAll('a');
		links.forEach((link) => {
			link.setAttribute('target', '_blank');
			link.setAttribute('rel', 'noopener noreferrer');
		});
	}

	(() => acceptConfirmationForm.fields.set({ id }))();
</script>

<Head title="Login Confirmation" description="Please accept the login confirmation to continue." />

<div class="my-8 flex w-full flex-row items-center justify-center md:my-16 lg:my-32">
	<div class="bg-card mx-2 flex max-w-lg flex-col gap-4 rounded-lg border-2 p-8">
		<h1 class="text-center text-2xl font-semibold">{confirmation.title ?? 'Please Accept To Continue'}</h1>
		<div class="my-4 text-base" id="contents">
			<ScrollArea class="flex max-h-64 flex-col rounded-lg border p-4 pr-2">
				<RenderHtml content={confirmation.content ?? ''} {@attach addLinkTarget} />
			</ScrollArea>
		</div>
		<div class="flex flex-row justify-center gap-4" data-sveltekit-preload-data="off">
			<Button variant="secondary" href="/logout" class="flex-1">Logout</Button>
			<form action="?/accept" method="post" class="contents" use:enhance>
				<input type="hidden" name="id" value={id} />
				<Button type="submit" class="group flex-1"
					>Accept<ArrowRight class="group-hover:animate-bounce-horizontal" /></Button
				>
			</form>
		</div>
		<div class="text-muted-foreground mt-4 text-center text-sm">
			By continuing to use this service, you agree to the contents of this notice.
		</div>
	</div>
</div>
