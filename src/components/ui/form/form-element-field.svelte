<script lang="ts" context="module">
	import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
	type T = Record<string, unknown>;
	type U = FormPathLeaves<T>;
</script>

<script
	lang="ts"
	generics="T extends Record<string, unknown ✂prettier:content✂="
	LCBVIGV4dGVuZHMgRm9ybVBhdGhMZWF2ZXM8VD4iPgoJaW1wb3J0IHR5cGUgeyBIVE1MQXR0cmlidXRlcyB9IGZyb20gInN2ZWx0ZS9lbGVtZW50cyI7CglpbXBvcnQgKiBhcyBGb3JtUHJpbWl0aXZlIGZyb20gImZvcm1zbmFwIjsKCWltcG9ydCB7IGNuIH0gZnJvbSAiJGxpYi91dGlscy5qcyI7CgoJdHlwZSAkJFByb3BzID0gRm9ybVByaW1pdGl2ZS5FbGVtZW50RmllbGRQcm9wczxULCBVPiAmIEhUTUxBdHRyaWJ1dGVzPEhUTUxFbGVtZW50PjsKCglleHBvcnQgbGV0IGZvcm06IFN1cGVyRm9ybTxUPjsKCWV4cG9ydCBsZXQgbmFtZTogVTsKCglsZXQgY2xhc3NOYW1lOiAkJFByb3BzWyJjbGFzcyJdID0gdW5kZWZpbmVkOwoJZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07Cg="=""
></script>

<FormPrimitive.ElementField {form} {name} let:constraints let:errors let:tainted let:value>
	<div class={cn('space-y-2', className)}>
		<slot {constraints} {errors} {tainted} {value} />
	</div>
</FormPrimitive.ElementField>
