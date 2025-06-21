import { Tooltip as TooltipPrimitive } from 'bits-ui';
import Simple from './tooltip-simple.svelte';
import Trigger from './tooltip-trigger.svelte';
import Content from './tooltip-content.svelte';

const Root = TooltipPrimitive.Root;
const Provider = TooltipPrimitive.Provider;
const Portal = TooltipPrimitive.Portal;

export {
	Root,
	Trigger,
	Content,
	Simple,
	Provider,
	Portal,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Portal as TooltipPortal,
	Simple as SimpleTooltip,
};
