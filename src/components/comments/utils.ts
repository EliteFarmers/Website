import type { CommentDto } from '$lib/api';

/**
 * Build a flat list of comments into a tree structure by parentId
 */
export function buildCommentTree(comments: CommentDto[]): CommentDto[] {
	return comments.filter((c) => !c.parentId);
}

/**
 * Get all child comments for a given parent ID
 */
export function getChildComments(comments: CommentDto[], parentId: number | null): CommentDto[] {
	return comments.filter((c) => c.parentId === parentId);
}

/**
 * Count total descendants of a comment (including children of children, etc.)
 */
export function countDescendants(comments: CommentDto[], commentId: number): number {
	const children = getChildComments(comments, commentId);
	return children.length + children.reduce((sum, child) => sum + countDescendants(comments, child.id), 0);
}

/**
 * Find a comment by ID in a flat array
 */
export function findComment(comments: CommentDto[], id: number): CommentDto | undefined {
	return comments.find((c) => c.id === id);
}

/**
 * Get the depth of a comment in the tree (root = 0)
 */
export function getCommentDepth(comments: CommentDto[], commentId: number): number {
	const comment = findComment(comments, commentId);
	if (!comment || !comment.parentId) return 0;

	return 1 + getCommentDepth(comments, comment.parentId);
}

/**
 * Get all ancestors of a comment (from root to parent)
 */
export function getAncestors(comments: CommentDto[], commentId: number): CommentDto[] {
	const comment = findComment(comments, commentId);
	if (!comment || !comment.parentId) return [];

	const parent = findComment(comments, comment.parentId);
	if (!parent) return [];

	return [...getAncestors(comments, parent.id), parent];
}

/**
 * Sort comments chronologically (oldest first)
 */
export function sortCommentsByDate(comments: CommentDto[]): CommentDto[] {
	return [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Sort comments by score (highest first)
 */
export function sortCommentsByScore(comments: CommentDto[]): CommentDto[] {
	return [...comments].sort((a, b) => b.score - a.score);
}

/**
 * Filter comments by author
 */
export function filterByAuthor(comments: CommentDto[], authorName: string): CommentDto[] {
	return comments.filter((c) => c.author.name === authorName);
}

/**
 * Search comments by content
 */
export function searchComments(comments: CommentDto[], query: string): CommentDto[] {
	const lower = query.toLowerCase();
	return comments.filter(
		(c) => c.content.toLowerCase().includes(lower) || c.author.name.toLowerCase().includes(lower)
	);
}
