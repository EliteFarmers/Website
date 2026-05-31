<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import { SiYoutube as YoutubeIcon } from '@icons-pack/svelte-simple-icons';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Code from '@lucide/svelte/icons/code';
	import Coins from '@lucide/svelte/icons/coins';
	import Columns from '@lucide/svelte/icons/columns-2';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import Grid3x3 from '@lucide/svelte/icons/grid-3x3';
	import Heading1 from '@lucide/svelte/icons/heading-1';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Heading3 from '@lucide/svelte/icons/heading-3';
	import ImageIcon from '@lucide/svelte/icons/image';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import LinkIcon from '@lucide/svelte/icons/link';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Package from '@lucide/svelte/icons/package';
	import Pilcrow from '@lucide/svelte/icons/pilcrow-left';
	import Quote from '@lucide/svelte/icons/quote';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import SquareChevronDown from '@lucide/svelte/icons/square-chevron-down';
	import TableIcon from '@lucide/svelte/icons/table-2';
	import Users from '@lucide/svelte/icons/users';
	import BlockDictionaryEntry from './block-dictionary-entry.svelte';
	import BlockDictionarySection from './block-dictionary-section.svelte';
</script>

<Head
	title="Elite | Guide Block Dictionary"
	description="A reference for every block and insert available in the Elite guide editor."
	canonicalPath="/info/guides"
/>

<div class="mt-8 mb-16 flex w-full flex-row items-center justify-center md:mt-16 md:mb-32">
	<div class="mx-2 flex w-full max-w-4xl flex-col gap-8 sm:mx-4">
		<header class="markdown space-y-3">
			<h1>Guide Block Dictionary</h1>
			<p class="text-muted-foreground text-base leading-7">
				A quick reference for guide editor blocks and the toolbar buttons that insert them.
			</p>
		</header>

		<BlockDictionarySection title="Text Structure" description="Writing blocks for organizing guide content.">
			<BlockDictionaryEntry name="Paragraph" description="Default body text.">
				<Pilcrow class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Heading 1" description="Largest section heading.">
				<Heading1 class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Heading 2" description="Standard section heading.">
				<Heading2 class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Heading 3" description="Small subsection heading.">
				<Heading3 class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Bullet List" description="Unordered list.">
				<List class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Numbered List" description="Ordered step list.">
				<ListOrdered class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Quote" description="Indented quote block.">
				<Quote class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Code" description="Inline code text.">
				<Code class="size-4" />
			</BlockDictionaryEntry>
		</BlockDictionarySection>

		<BlockDictionarySection
			title="Links And Media"
			description="External references, uploaded assets, and embedded media."
		>
			<BlockDictionaryEntry name="Link" description="Inline hyperlink for ordinary URLs.">
				<LinkIcon class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry
				name="Wiki Link"
				description="Inline Hypixel SkyBlock wiki link. Paste a wiki page URL and it will render with the Elite wiki shortcut."
			>
				<BookOpen class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Image" description="Uploaded responsive guide image.">
				<ImageIcon class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry
				name="Guide Asset"
				description="Opens uploaded guide assets so images and litematics can be selected from the guide asset list."
			>
				<FileArchive class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="YouTube Video" description="Embedded YouTube player.">
				<YoutubeIcon class="size-4" />
			</BlockDictionaryEntry>
		</BlockDictionarySection>

		<BlockDictionarySection
			title="SkyBlock Elements"
			description="SkyBlock-specific blocks for items, prices, recipes, and build grids."
		>
			<BlockDictionaryEntry name="SkyBlock Item" description="Item icon and name from a SkyBlock item ID.">
				<Package class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Item Price" description="Current item price with an optional multiplier.">
				<Coins class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Recipe" description="Crafting recipe grid.">
				<Grid3x3 class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Item List" description="Structured material or shopping list.">
				<ShoppingCart class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Block Grid" description="Minecraft block layout grid.">
				<LayoutGrid class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry
				name="Litematic"
				description="Attached Litematica schematic file. Upload it as a guide asset, then insert it into the guide."
			>
				<FileArchive class="size-4" />
			</BlockDictionaryEntry>
		</BlockDictionarySection>

		<BlockDictionarySection
			title="Layout And Callouts"
			description="Blocks for larger sections and highlighted information."
		>
			<BlockDictionaryEntry name="Two Column (Plain)" description="Side-by-side content without a strong frame.">
				<Columns class="stroke-muted-foreground size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Two Column (Bordered)" description="Side-by-side content with visible borders.">
				<Columns class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Table" description="Rows and columns for structured values.">
				<TableIcon class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Callout" description="Highlighted note, warning, tip, or correction.">
				<AlertCircle class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry name="Accordion" description="Collapsible section for optional detail.">
				<SquareChevronDown class="size-4" />
			</BlockDictionaryEntry>
			<BlockDictionaryEntry
				name="Credits"
				description="Two-column credits table for Minecraft usernames and a short note about what they contributed."
			>
				<Users class="size-4" />
			</BlockDictionaryEntry>
		</BlockDictionarySection>
	</div>
</div>
