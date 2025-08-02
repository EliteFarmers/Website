import { Tooltip as TooltipPrimitive } from 'bits-ui';
import Content from './tooltip-content.svelte';
import Simple from './tooltip-simple.svelte';
import Trigger from './tooltip-trigger.svelte';

const Root = TooltipPrimitive.Root;
const Provider = TooltipPrimitive.Provider;
const Portal = TooltipPrimitive.Portal;

export {
	Content,
	Portal,
	Provider,
	Root,
	Simple,
	Simple as SimpleTooltip,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Portal as TooltipPortal,
	Provider as TooltipProvider,
	Trigger as TooltipTrigger,
	Trigger,
};
