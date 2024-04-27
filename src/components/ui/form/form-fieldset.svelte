<script lang="ts" context="module">
	import type { FormPath, SuperForm } from 'sveltekit-superforms';
	type T = Record<string, unknown>;
	type U = FormPath<T>;
</script>

<script
	lang="ts"
	generics="T extends Record<string, unknown ✂prettier:content✂="
	LCBVIGV4dGVuZHMgRm9ybVBhdGg8VD4iPgoJaW1wb3J0ICogYXMgRm9ybVByaW1pdGl2ZSBmcm9tICJmb3Jtc25hcCI7CglpbXBvcnQgeyBjbiB9IGZyb20gIiRsaWIvdXRpbHMuanMiOwoKCXR5cGUgJCRQcm9wcyA9IEZvcm1QcmltaXRpdmUuRmllbGRzZXRQcm9wczxULCBVPjsKCglleHBvcnQgbGV0IGZvcm06IFN1cGVyRm9ybTxUPjsKCWV4cG9ydCBsZXQgbmFtZTogVTsKCglsZXQgY2xhc3NOYW1lOiAkJFByb3BzWyJjbGFzcyJdID0gdW5kZWZpbmVkOwoJZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07Cg="=""
></script>

<FormPrimitive.Fieldset
	{form}
	{name}
	let:constraints
	let:errors
	let:tainted
	let:value
	class={cn('space-y-2', className)}
>
	<slot {constraints} {errors} {tainted} {value} />
</FormPrimitive.Fieldset>
