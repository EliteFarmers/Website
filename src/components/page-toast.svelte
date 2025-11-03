<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import type { ErrorResponse } from '$lib/api';
	import { watch } from 'runed';
	import { toast, Toaster } from 'svelte-sonner';

	watch(
		() => page.form,
		() => {
			if (!page.form) return;

			if (page.form?.success) {
				toast.success('Success!', {
					duration: 5000,
					class: 'text-success',
				});
				return;
			}

			let problem = page.form.problem as ErrorResponse | undefined;

			if (!problem && page.form?.error && typeof page.form.error === 'object') {
				problem = page.form.error as ErrorResponse;
			}

			if (problem) {
				if (dev) {
					console.error(problem);
				}
				toast.error(Object.values(problem.errors).join('\n') || problem.message, {
					duration: 5000,
					class: 'text-destructive',
				});
				return;
			}

			if (page.form?.error) {
				toast.error(page.form.error as string, {
					duration: 5000,
					class: 'text-destructive',
				});
				return;
			}
		}
	);
</script>

<Toaster />
