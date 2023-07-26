<script lang="ts">
	export let ign: string;
	export let base = '';
	export let overlay = '';

	const steve =
		'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA60lEQVQYlQXBv0rDQADA4V8ul1xSaatQmiKFCj6AL+Asgmt3h4KLjyDugpuDLj6AuDjUQR2Kq6+gUK0WtUMJlNRyyf3x+4Kdrbo3DmQg0NZgjEUIQSRDvAdpHAAY71hLYppxgCVkXmist0iA8+NDVBSTJg1WywWEgvz3m7O7B4Lb0yNfU4o/rQlDRb7I6WVtJh+vAIiaUhycXHDzvE1SlfSyNlf3GYPLIY3WJsH1YM9nnS5SrTMcjQDo7+8y/XxjPJsji8pSTsdMvpbURQTA49MLnW5KQIR8/5nhnKO10QRAVyWpSihWFl2V/AOcYVkEZ+xVqQAAAABJRU5ErkJggg==';
</script>

<div class="relative aspect-square h-[70%] md:h-[80%] lg:h-[90%] flex justify-center items-center">
	<img class="w-[80%] absolute pixelated" src="data:image/png;base64,{base || steve}" alt={ign} aria-hidden="true" />
	{#if overlay && overlay !== ''}
		<img class="w-[90%] absolute pixelated" src="data:image/png;base64,{overlay}" alt="" aria-hidden="true" />
	{/if}
</div>
