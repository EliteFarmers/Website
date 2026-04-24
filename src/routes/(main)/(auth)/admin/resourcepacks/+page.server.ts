import { createManagedResourcePack, listManagedResourcePacks } from '$lib/api';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const { session, access_token: token } = locals;

	if (!session || !session.perms.packowner || !token) {
		throw error(404, 'Not Found');
	}

	const pendingOnly = session.perms.admin && url.searchParams.get('view') === 'pending';

	const [allPacksResult, pendingPacksResult] = await Promise.all([
		listManagedResourcePacks({ pendingOnly: false }),
		session.perms.admin ? listManagedResourcePacks({ pendingOnly: true }) : Promise.resolve(null),
	]);

	if (!allPacksResult.ok) {
		throw error(
			allPacksResult.response.status,
			getProblemMessage(allPacksResult.error, 'Failed to load texture packs.')
		);
	}

	const allPacks = allPacksResult.data ?? [];
	const pendingPacks = pendingPacksResult?.ok
		? (pendingPacksResult.data ?? [])
		: allPacks.filter((pack) => pack.stagedVersion?.status === 'pendingApproval');

	return {
		packs: pendingOnly ? pendingPacks : allPacks,
		totalCount: allPacks.length,
		pendingCount: pendingPacks.length,
		pendingOnly,
		isAdmin: session.perms.admin,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	createPack: async ({ locals, request }) => {
		if (!locals.session?.perms.admin || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const slug = data.get('slug')?.toString().trim();
		const displayName = data.get('displayName')?.toString().trim();
		const directoryName = data.get('directoryName')?.toString().trim();
		const modrinthProjectUrl = data.get('modrinthProjectUrl')?.toString().trim();
		const authors = parseManagedPackAuthors(data.get('authors')?.toString());
		const notes = data.get('notes')?.toString().trim();

		if (!slug || !displayName || !directoryName || !modrinthProjectUrl) {
			return fail(400, {
				action: 'createPack',
				error: 'Slug, display name, directory name, and Modrinth project URL are required.',
			});
		}

		const result = await createManagedResourcePack({
			slug,
			displayName,
			directoryName,
			modrinthProjectUrl,
			authors,
			notes: notes || null,
		});

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'createPack',
				error: getProblemMessage(result.error, 'Failed to create the managed pack.'),
			});
		}

		throw redirect(303, `/admin/resourcepacks/${result.data.id}`);
	},
};

function getProblemMessage(problem: unknown, fallback: string) {
	if (problem && typeof problem === 'object' && 'message' in problem && typeof problem.message === 'string') {
		return problem.message;
	}

	return fallback;
}

function parseManagedPackAuthors(value?: string) {
	const authors = (value ?? '')
		.split(/[\n,]/)
		.map((author) => author.trim())
		.filter(Boolean);

	return authors.length ? authors : null;
}
