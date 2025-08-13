import { Popover as PopoverPrimitive } from 'bits-ui';
import Content from './popover-content.svelte';
import Mobile from './popover-mobile.svelte';
import Trigger from './popover-trigger.svelte';
const Root = PopoverPrimitive.Root;
const Close = PopoverPrimitive.Close;

export {
	Close,
	Content,
	Mobile,
	//
	Root as Popover,
	Close as PopoverClose,
	Content as PopoverContent,
	Mobile as PopoverMobile,
	Trigger as PopoverTrigger,
	Root,
	Trigger,
};
