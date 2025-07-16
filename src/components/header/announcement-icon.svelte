<script lang="ts" module>
	import type { components } from '$lib/api/api';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import ArrowBigUpDash from '@lucide/svelte/icons/arrow-big-up-dash';
	import LetterText from '@lucide/svelte/icons/letter-text';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Construction from '@lucide/svelte/icons/construction';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';

	const icons: Record<components['schemas']['AnnouncementType'], typeof Megaphone> = {
		other: Megaphone,
		article: LetterText,
		update: ArrowBigUpDash,
		news: Newspaper,
		event: Calendar,
		maintenance: Construction,
		shop: ShoppingCart,
	};
</script>

<script lang="ts">
	type Props = {
		announcement: components['schemas']['AnnouncementDto'];
		class?: string;
	};

	let { announcement, class: className }: Props = $props();

	const Icon = $derived(icons[announcement.type] || Megaphone);
</script>

<Icon class={className} />
