<script lang="ts">
	import Head from '$comp/head.svelte';
	import ProductPrice from '$comp/monetization/product-price.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { SelectSimple } from '$ui/select';
	import { Textarea } from '$ui/textarea';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import * as Dialog from '$ui/dialog';
	import * as Card from '$ui/card';
	import { pending } from '$lib/utils';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import { enhance } from '$app/forms';
	import Settings from 'lucide-svelte/icons/settings-2';
	import { onMount } from 'svelte';

	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let category = $derived(data.category);
	let loading = $state(false);
</script>

<Head title="Product" description="Manage product" />

<main class="my-16">
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">{category.title}</h1>

		{#if category.description}
			<p class="mb-8">{category.description}</p>
		{/if}

		<form method="post" action="?/editCategory" class="flex w-full flex-col gap-2" use:enhance>
			<input type="hidden" name="id" bind:value={category.id} />

			<div class="flex flex-col items-start gap-2">
				<Label>Title</Label>
				<Input name="title" value={category.title} placeholder="Category Title" maxlength={256} />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Slug</Label>
				<Input name="slug" value={category.slug} placeholder="Category URL slug" maxlength={32} />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Description</Label>
				<Textarea
					name="description"
					value={category.description}
					placeholder="Category Description"
					maxlength={512}
				/>
			</div>

			<div class="flex flex-row items-center gap-2">
				<Switch name="published" checked={category.published}></Switch>
				<Label>Published</Label>
			</div>

			<Button type="submit" class="w-fit pt-2">Save Changes</Button>
		</form>
	</section>
</main>
