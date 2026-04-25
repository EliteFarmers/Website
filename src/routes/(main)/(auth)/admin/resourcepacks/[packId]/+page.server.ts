import {
	approveManagedResourcePackVersion,
	assignManagedResourcePackOwner,
	downloadManagedResourcePackVersion,
	getAdmins,
	getManagedResourcePackAuditLogs,
	getManagedResourcePackVersions,
	listManagedResourcePacks,
	rejectManagedResourcePackVersion,
	removeManagedResourcePackOwner,
	submitManagedResourcePackVersion,
	updateManagedResourcePack,
} from '$lib/api';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const VERSION_PAGE_SIZE = 10;
const LOG_PAGE_SIZE = 10;

export const load = (async ({ locals, params, url }) => {
	const { session, access_token: token } = locals;

	if (!session || !session.perms.packowner || !token) {
		throw error(404, 'Not Found');
	}

	const packsResult = await listManagedResourcePacks({ pendingOnly: false });

	if (!packsResult.ok) {
		throw error(packsResult.response.status, getProblemMessage(packsResult.error, 'Failed to load texture packs.'));
	}

	const pack = (packsResult.data ?? []).find((item) => `${item.id}` === params.packId);

	if (!pack) {
		throw error(404, 'Texture pack not found.');
	}

	const versionOffset = getOffset(url.searchParams.get('versionOffset'));
	const logOffset = getOffset(url.searchParams.get('logOffset'));

	const [versionsResult, auditLogsResult, privilegedUsersResult] = await Promise.all([
		getManagedResourcePackVersions(pack.id, { offset: versionOffset, limit: VERSION_PAGE_SIZE }),
		getManagedResourcePackAuditLogs(pack.id, { offset: logOffset, limit: LOG_PAGE_SIZE }),
		session.perms.admin ? getAdmins() : Promise.resolve(null),
	]);

	const packOwnerCandidates =
		privilegedUsersResult?.ok && privilegedUsersResult.data
			? privilegedUsersResult.data
					.filter((user) => user.roles.includes('PackOwner'))
					.sort((a, b) => a.displayName.localeCompare(b.displayName))
			: [];

	return {
		pack,
		isAdmin: session.perms.admin,
		packOwnerCandidates,
		versionOffset,
		versionLimit: VERSION_PAGE_SIZE,
		logOffset,
		logLimit: LOG_PAGE_SIZE,
		versions: versionsResult.ok
			? versionsResult.data
			: {
					offset: versionOffset,
					limit: VERSION_PAGE_SIZE,
					totalCount: 0,
					versions: [],
				},
		versionsError: versionsResult.ok ? null : getProblemMessage(versionsResult.error, 'Failed to load versions.'),
		auditLogs: auditLogsResult.ok
			? auditLogsResult.data
			: {
					offset: logOffset,
					limit: LOG_PAGE_SIZE,
					totalCount: 0,
					logs: [],
				},
		auditLogsError: auditLogsResult.ok
			? null
			: getProblemMessage(auditLogsResult.error, 'Failed to load audit history.'),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	updatePack: async ({ locals, params, request }) => {
		if (!locals.session?.perms.admin || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
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
				action: 'updatePack',
				error: 'Slug, display name, directory name, and Modrinth project URL are required.',
			});
		}

		const result = await updateManagedResourcePack(packId, {
			slug,
			displayName,
			directoryName,
			modrinthProjectUrl,
			authors,
			notes: notes || null,
		});

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'updatePack',
				error: getProblemMessage(result.error, 'Failed to update the managed pack.'),
			});
		}

		return {
			success: true,
			action: 'updatePack',
			message: 'Updated pack metadata.',
		};
	},
	assignOwner: async ({ locals, params, request }) => {
		if (!locals.session?.perms.admin || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const accountId = data.get('accountId')?.toString().trim();

		if (!accountId) {
			return fail(400, {
				action: 'assignOwner',
				error: 'Select a PackOwner to assign.',
			});
		}

		const result = await assignManagedResourcePackOwner(packId, accountId);

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'assignOwner',
				error: getProblemMessage(result.error, 'Failed to assign that pack owner.'),
			});
		}

		return {
			success: true,
			action: 'assignOwner',
			message: 'Assigned the pack to the selected owner.',
		};
	},
	removeOwner: async ({ locals, params, request }) => {
		if (!locals.session?.perms.admin || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const accountId = data.get('accountId')?.toString().trim();

		if (!accountId) {
			return fail(400, {
				action: 'removeOwner',
				error: 'Choose an owner to remove.',
			});
		}

		const result = await removeManagedResourcePackOwner(packId, accountId);

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'removeOwner',
				error: getProblemMessage(result.error, 'Failed to remove that pack owner.'),
			});
		}

		return {
			success: true,
			action: 'removeOwner',
			message: 'Removed the pack owner assignment.',
		};
	},
	downloadVersion: async ({ locals, params, request }) => {
		if (!locals.session?.perms.packowner || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const versionId = data.get('versionId')?.toString().trim();

		if (!versionId) {
			return fail(400, { action: 'downloadVersion', error: 'Choose a Modrinth version first.' });
		}

		const result = await downloadManagedResourcePackVersion(packId, versionId);

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'downloadVersion',
				error: getProblemMessage(result.error, 'Failed to stage that version.'),
				cooldownUntil: result.response.status === 429 ? Date.now() + 60_000 : undefined,
			});
		}

		return {
			success: true,
			action: 'downloadVersion',
			message: `Staged ${result.data.displayName} for validation.`,
		};
	},
	submitVersion: async ({ locals, params, request }) => {
		if (!locals.session?.perms.packowner || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const submissionNotes = data.get('submissionNotes')?.toString().trim();

		const result = await submitManagedResourcePackVersion(packId, {
			submissionNotes: submissionNotes || null,
		});

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'submitVersion',
				error: getProblemMessage(result.error, 'Failed to submit the staged version.'),
			});
		}

		return {
			success: true,
			action: 'submitVersion',
			message: 'Submitted the staged version for admin approval.',
		};
	},
	approveVersion: async ({ locals, params }) => {
		if (!locals.session?.perms.admin || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
			throw error(404, 'Not Found');
		}

		const result = await approveManagedResourcePackVersion(packId);

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'approveVersion',
				error: getProblemMessage(result.error, 'Failed to approve the staged version.'),
			});
		}

		return {
			success: true,
			action: 'approveVersion',
			message: 'Approved the staged version and promoted it live.',
		};
	},
	rejectVersion: async ({ locals, params, request }) => {
		if (!locals.session?.perms.admin || !locals.access_token) {
			throw error(404, 'Not Found');
		}

		const packId = params.packId;
		if (!packId) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const reason = data.get('reason')?.toString().trim();

		const result = await rejectManagedResourcePackVersion(packId, {
			reason: reason || null,
		});

		if (!result.ok) {
			return fail(result.response.status, {
				action: 'rejectVersion',
				error: getProblemMessage(result.error, 'Failed to reject the staged version.'),
			});
		}

		return {
			success: true,
			action: 'rejectVersion',
			message: 'Rejected the staged version and reopened the pack for a new download.',
		};
	},
};

function getOffset(value: string | null) {
	if (!value) return 0;

	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 0) return 0;

	return parsed;
}

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
