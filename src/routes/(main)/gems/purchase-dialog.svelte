<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import type { Snippet } from 'svelte';

	interface Props {
    openWith: (Snippet | null) => void;
  }

  let { openWith = (null) }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.ScrollContent class="dark">
		<Dialog.Header class="flex flex-col items-center justify-center gap-2">Hi</Dialog.Header>

		<Button type="button" class="max-w-fit p-0" variant="link">Reset Emoji</Button>
	</Dialog.ScrollContent>
</Dialog.Root>
