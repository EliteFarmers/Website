<script lang="ts" module>
	import type { AnnouncementDto, AnnouncementType } from '$lib/api';
	import ArrowBigUpDash from '@lucide/svelte/icons/arrow-big-up-dash';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Construction from '@lucide/svelte/icons/construction';
	import LetterText from '@lucide/svelte/icons/letter-text';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';

	const icons: Record<AnnouncementType, typeof Megaphone> = {
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
		announcement: AnnouncementDto;
		class?: string;
	};

	let { announcement, class: className }: Props = $props();

	const Icon = $derived(icons[announcement.type] || Megaphone);
</script>

<Icon class={className} />
