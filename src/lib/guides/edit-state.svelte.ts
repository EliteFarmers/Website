import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { RootNode } from '$comp/blocks/blocks';
import { guideContentReferencesAsset } from '$lib/guides/assets';
import { ensureGuideBlockIds } from '$lib/guides/block-ids';
import type { FullGuideWithAuthors, GuideAssetDto, GuideAuthorDto, GuideVersionDto } from '$lib/guides/types';
import {
	deleteGuideAssetCommand,
	deleteGuideCommand,
	replaceGuideAuthorsCommand,
	resolveGuideAuthorCommand,
	restoreGuideVersionCommand,
	submitGuideForApprovalCommand,
	updateGuideCommand,
} from '$lib/remote/guides.remote';
import { getContext, setContext } from 'svelte';
import { SvelteDate } from 'svelte/reactivity';

export type EditableGuideAuthor = {
	id: string;
	name: string;
	uuid?: string | null;
	isOwner: boolean;
};

export const MAX_GUIDE_AUTHORS = 4;

const GUIDE_EDIT_CONTEXT = 'elite-guide-edit';

function notifyError(message: string) {
	console.error(message);
}

function notifySuccess(message: string) {
	console.info(message);
}

export class GuideEditState {
	readonly basePath: string;

	title = $state('');
	description = $state('');
	markdownContent = $state('');
	editorContent = $state<RootNode | null>(null);
	skyblockIconId = $state('');
	tags = $state<string[]>([]);
	guideId = $state<number | null>(null);
	concurrencyVersion = $state(0);
	hasLoadedGuide = $state(false);
	editableAuthors = $state<EditableGuideAuthor[]>([]);

	isSaving = $state(false);
	isSubmitting = $state(false);
	isDeleting = $state(false);
	showDeleteDialog = $state(false);
	showSubmitDialog = $state(false);
	isSavingAuthors = $state(false);
	isResolvingAuthor = $state(false);
	authorError = $state<string | null>(null);
	authorSearchOpen = $state(false);
	authorSearchValue = $state('');
	historyError = $state<string | null>(null);
	previewVersion = $state<GuideVersionDto | null>(null);
	saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	saveError = $state<string | null>(null);
	lastSavedSnapshot = $state('');
	lastSaveTime = $state<Date | null>(null);
	needsContentNormalizationSave = $state(false);
	guideData = $state<FullGuideWithAuthors | undefined>();

	#saveTimeout: ReturnType<typeof setTimeout> | null = null;
	#activeSave: Promise<boolean> | null = null;

	previewBlocks = $derived.by(() => this.parseGuideBlocks(this.previewVersion?.content ?? ''));
	guideAuthors = $derived.by((): GuideAuthorDto[] => {
		if (!this.guideData) return [];
		return this.guideData.authors?.length
			? this.guideData.authors
			: [{ author: this.guideData.author, isOwner: true, role: 'Owner' }];
	});
	ownerAuthor = $derived(this.guideAuthors.find((author) => author.isOwner) ?? this.guideAuthors[0]);
	canManageGuide = $derived(
		Boolean(page.data.session?.perms.admin || this.ownerAuthor?.author.id === page.data.session?.id)
	);
	editableOwnerId = $derived(this.editableAuthors.find((author) => author.isOwner)?.id ?? '');

	constructor(slug: string) {
		this.basePath = `/guides/${slug}/edit`;

		$effect(() => {
			const snapshot = this.getSaveSnapshot();
			if (!this.hasLoadedGuide || snapshot === this.lastSavedSnapshot) {
				return;
			}
			if (!this.title.trim() || !this.description.trim()) {
				return;
			}

			this.clearPendingSave();
			this.saveStatus = 'saving';
			this.saveError = null;
			this.#saveTimeout = setTimeout(() => {
				this.#saveTimeout = null;
				void this.saveCurrentDraft();
			}, 3000);

			return () => this.clearPendingSave();
		});
	}

	getContentToSave() {
		return this.editorContent ? JSON.stringify(this.editorContent) : this.markdownContent;
	}

	getSaveSnapshot() {
		return JSON.stringify({
			title: this.title,
			description: this.description,
			markdownContent: this.getContentToSave(),
			iconSkyblockId: this.skyblockIconId.trim(),
			tags: [...this.tags],
		});
	}

	parseGuideBlocks(content: string): RootNode | null {
		const trimmed = content.trim();
		if (!trimmed.startsWith('[')) return null;

		try {
			const parsed = JSON.parse(trimmed);
			return Array.isArray(parsed) ? ensureGuideBlockIds(parsed as RootNode) : null;
		} catch {
			return null;
		}
	}

	isAssetReferenced(assetId: string) {
		return this.editorContent
			? guideContentReferencesAsset(this.editorContent, assetId)
			: guideContentReferencesAsset(this.markdownContent, assetId);
	}

	clearPendingSave() {
		if (this.#saveTimeout) {
			clearTimeout(this.#saveTimeout);
			this.#saveTimeout = null;
		}
	}

	requireGuideId() {
		if (!this.guideId) {
			throw new Error('Guide not loaded yet');
		}
		return this.guideId;
	}

	loadGuideIntoState(guide: FullGuideWithAuthors, force = false) {
		this.guideData = guide;
		if (!force && this.guideId !== null) return;
		this.guideId = guide.id;
		this.title = guide.title;
		this.description = guide.description;
		this.markdownContent = guide.content;
		this.tags = (guide.tagIds ?? []).map((id) => id.toString());
		this.skyblockIconId = guide.iconSkyblockId || '';
		this.concurrencyVersion = guide.concurrencyVersion ?? 0;
		this.loadEditorContent(guide.content);
		this.loadGuideAuthorsIntoState(guide);

		this.lastSavedSnapshot = this.getSaveSnapshot();
		this.hasLoadedGuide = true;
	}

	loadGuideAuthorsIntoState(guide: FullGuideWithAuthors) {
		const authorList = guide.authors?.length
			? guide.authors
			: [{ author: guide.author, isOwner: true, role: 'Owner' }];
		this.editableAuthors = this.normalizeEditableAuthors(authorList);
	}

	normalizeEditableAuthors(authors: GuideAuthorDto[]): EditableGuideAuthor[] {
		const normalized = authors.map((author) => ({
			id: author.author.id,
			name: author.author.name,
			uuid: author.author.uuid,
			isOwner: author.isOwner,
		}));

		if (normalized.length > 0 && !normalized.some((author) => author.isOwner)) {
			normalized[0].isOwner = true;
		}

		return normalized;
	}

	loadEditorContent(content: string) {
		this.editorContent = null;
		this.needsContentNormalizationSave = false;
		if (content && content.trim().startsWith('[')) {
			try {
				const parsed = JSON.parse(content);
				if (Array.isArray(parsed)) {
					const normalized = ensureGuideBlockIds(parsed as RootNode);
					const normalizedContent = JSON.stringify(normalized);
					this.editorContent = normalized;
					this.needsContentNormalizationSave = normalizedContent !== JSON.stringify(parsed);
					if (this.needsContentNormalizationSave) {
						this.markdownContent = normalizedContent;
					}
				}
			} catch {
				// Not JSON, keep as markdown.
			}
		}
	}

	async handleSave() {
		return await this.saveLatestDraft();
	}

	async saveLatestDraft() {
		this.clearPendingSave();

		if (!this.title.trim() || !this.description.trim()) {
			this.saveError = 'Title and description are required';
			notifyError(this.saveError);
			return false;
		}
		if (!this.guideId) {
			this.saveError = 'Guide not loaded yet';
			notifyError(this.saveError);
			return false;
		}

		while (this.needsContentNormalizationSave || this.getSaveSnapshot() !== this.lastSavedSnapshot) {
			const saved = await this.saveCurrentDraft();
			if (!saved) return false;
		}

		this.saveStatus = 'saved';
		return true;
	}

	async saveCurrentDraft() {
		if (this.#activeSave) {
			return await this.#activeSave;
		}

		this.#activeSave = this.performSave();
		try {
			return await this.#activeSave;
		} finally {
			this.#activeSave = null;
		}
	}

	async performSave() {
		if (!this.guideId) {
			this.saveError = 'Guide not loaded yet';
			notifyError(this.saveError);
			return false;
		}

		const snapshotToSave = this.getSaveSnapshot();
		const contentToSave = this.getContentToSave();

		this.isSaving = true;
		this.saveStatus = 'saving';
		this.saveError = null;

		try {
			const result = await updateGuideCommand({
				id: this.guideId,
				title: this.title,
				description: this.description,
				markdownContent: contentToSave,
				iconSkyblockId: this.skyblockIconId.trim(),
				tags: [...this.tags],
				concurrency: this.concurrencyVersion,
			});

			if (result.error) {
				this.saveError = result.error;
				this.saveStatus = 'idle';
				notifyError(result.error);
				return false;
			}

			this.markdownContent = contentToSave;
			this.needsContentNormalizationSave = false;
			this.concurrencyVersion = result.version ?? this.concurrencyVersion;
			this.lastSavedSnapshot = snapshotToSave;

			this.saveStatus = 'saved';
			this.lastSaveTime = new SvelteDate();
			notifySuccess('Guide saved');

			setTimeout(() => {
				if (this.getSaveSnapshot() === this.lastSavedSnapshot) {
					this.saveStatus = 'idle';
				}
			}, 2000);

			return true;
		} catch (err) {
			this.saveError = 'Failed to save guide';
			this.saveStatus = 'idle';
			notifyError(this.saveError);
			console.error(err);
			return false;
		} finally {
			this.isSaving = false;
		}
	}

	async handleSubmitForApproval() {
		const contentHasValue = this.editorContent
			? this.editorContent.length > 0
			: this.markdownContent.trim().length > 0;
		if (!this.title.trim() || !this.description.trim() || !contentHasValue) {
			notifyError('Please fill in all fields before submitting');
			return;
		}
		if (!this.guideId) {
			notifyError('Guide not loaded yet');
			return;
		}

		this.isSubmitting = true;

		try {
			const saved = await this.saveLatestDraft();
			if (!saved) {
				return;
			}

			const result = await submitGuideForApprovalCommand(this.guideId);

			if (result.error) {
				console.error(result);
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide submitted for approval!');
			await goto('/profile/guides');
		} catch (err) {
			notifyError('Failed to submit guide');
			console.error(err);
		} finally {
			this.isSubmitting = false;
		}
	}

	async handleDelete() {
		if (!this.guideId) {
			notifyError('Guide not loaded yet');
			return;
		}
		this.isDeleting = true;

		try {
			const result = await deleteGuideCommand(this.guideId);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide deleted');
			await goto('/guides');
		} catch (err) {
			notifyError('Failed to delete guide');
			console.error(err);
		} finally {
			this.isDeleting = false;
		}
	}

	async handleSaveAuthors() {
		if (!this.guideId) return false;
		this.authorError = null;

		const owner = this.editableAuthors.find((author) => author.isOwner);
		if (!owner) {
			this.authorError = 'Select an owner before saving';
			notifyError(this.authorError);
			return false;
		}

		if (this.editableAuthors.length > MAX_GUIDE_AUTHORS) {
			this.authorError = `Guides can have at most ${MAX_GUIDE_AUTHORS} authors`;
			notifyError(this.authorError);
			return false;
		}

		this.isSavingAuthors = true;

		try {
			const result = await replaceGuideAuthorsCommand({
				guideId: this.guideId,
				ownerId: owner.id,
				editorIds: this.editableAuthors.filter((author) => !author.isOwner).map((author) => author.id),
			});

			if (result.error) {
				this.authorError = result.error;
				notifyError(result.error);
				return false;
			}

			if (this.guideData) {
				this.guideData = {
					...this.guideData,
					authors: this.editableAuthors.map((author) => ({
						author: {
							id: author.id,
							name: author.name,
							uuid: author.uuid,
						},
						isOwner: author.isOwner,
						role: author.isOwner ? 'Owner' : 'Editor',
					})),
				};
			}
			notifySuccess('Guide authors updated');
			return true;
		} finally {
			this.isSavingAuthors = false;
		}
	}

	async addAuthorByUsername(username: string) {
		this.authorError = null;
		if (this.editableAuthors.length >= MAX_GUIDE_AUTHORS) {
			this.authorError = `Guides can have at most ${MAX_GUIDE_AUTHORS} authors`;
			notifyError(this.authorError);
			return;
		}

		this.isResolvingAuthor = true;
		try {
			const result = await resolveGuideAuthorCommand(username);
			if (result.error || !result.account) {
				this.authorError = result.error || 'Failed to resolve player';
				notifyError(this.authorError);
				return;
			}

			if (this.editableAuthors.some((author) => author.id === result.account!.id)) {
				this.authorError = 'That player is already an author';
				notifyError(this.authorError);
				return;
			}

			this.editableAuthors = [
				...this.editableAuthors,
				{
					id: result.account.id,
					name: result.account.name,
					uuid: result.account.uuid,
					isOwner: this.editableAuthors.length === 0,
				},
			];
			this.authorSearchValue = '';
		} finally {
			this.isResolvingAuthor = false;
		}
	}

	makeOwner(authorId: string) {
		this.editableAuthors = this.editableAuthors.map((author) => ({
			...author,
			isOwner: author.id === authorId,
		}));
	}

	removeAuthor(authorId: string) {
		if (this.editableAuthors.length <= 1) {
			this.authorError = 'A guide needs at least one owner';
			notifyError(this.authorError);
			return;
		}

		const removedAuthor = this.editableAuthors.find((author) => author.id === authorId);
		const nextAuthors = this.editableAuthors.filter((author) => author.id !== authorId);

		if (removedAuthor?.isOwner && nextAuthors.length > 0) {
			nextAuthors[0] = { ...nextAuthors[0], isOwner: true };
		}

		this.editableAuthors = nextAuthors;
		this.authorError = null;
	}

	async handleRestoreVersion(version: GuideVersionDto) {
		if (!this.guideId) return false;
		this.historyError = null;

		try {
			const result = await restoreGuideVersionCommand({ guideId: this.guideId, versionId: version.id });
			if (result.error) {
				this.historyError = result.error;
				notifyError(result.error);
				return false;
			}

			this.title = version.title;
			this.description = version.description;
			this.markdownContent = version.content;
			this.loadEditorContent(version.content);
			this.concurrencyVersion = result.version ?? this.concurrencyVersion;
			this.lastSavedSnapshot = this.getSaveSnapshot();
			this.lastSaveTime = new SvelteDate();
			notifySuccess('Guide revision restored');
			return true;
		} catch (err) {
			this.historyError = 'Failed to restore guide revision';
			notifyError(this.historyError);
			console.error(err);
			return false;
		}
	}

	async deleteAsset(asset: GuideAssetDto) {
		if (!this.guideId) return false;
		if (this.isAssetReferenced(asset.id)) {
			notifyError('Remove this asset from the guide content before deleting it.');
			return false;
		}

		const result = await deleteGuideAssetCommand({ guideId: this.guideId, assetId: asset.id });

		if (result.error) {
			notifyError(result.error);
			return false;
		}

		if (this.guideData) {
			this.guideData = {
				...this.guideData,
				assets: this.guideData.assets.filter((item) => item.id !== asset.id),
			};
		}
		notifySuccess('Asset deleted');
		return true;
	}
}

export function setGuideEditContext(state: GuideEditState) {
	setContext(GUIDE_EDIT_CONTEXT, state);
	return state;
}

export function getGuideEditContext() {
	const state = getContext<GuideEditState>(GUIDE_EDIT_CONTEXT);
	if (!state) {
		throw new Error('Guide edit context not found');
	}
	return state;
}
