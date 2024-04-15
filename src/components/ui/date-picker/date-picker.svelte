<script lang="ts">
	import { Calendar as CalendarIcon } from 'lucide-svelte';
	import { type DateValue, DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { Button } from '$ui/button';
	import { Calendar } from '$ui/calendar';
	import * as Popover from '$ui/popover';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long',
	});

	export let value: DateValue | undefined = undefined;
	export let minValue: DateValue | undefined = undefined;
	export let maxValue: DateValue | undefined = undefined;
</script>

<Popover.Root openFocus>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')}
			builders={[builder]}
		>
			<CalendarIcon class="mr-2 h-4 w-4" />
			{value ? df.format(value.toDate(getLocalTimeZone())) : 'Select a date'}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value initialFocus {maxValue} {minValue} />
	</Popover.Content>
</Popover.Root>
