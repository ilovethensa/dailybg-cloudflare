import type { Post } from "./posts-db";

/**
 * Minimum number of posts an archive (tag/category) needs before it is worth
 * indexing. Thin archives are marked `noindex, follow` and kept out of the
 * sitemap so they don't compete with the articles they list.
 */
export const MIN_ARCHIVE_POSTS = 3;

/** Most recent modification across a list of posts (posts may be empty). */
export function latestModified(posts: Post[]): Date | null {
	let newest: Date | null = null;
	for (const post of posts) {
		const date = post.updatedDate ?? post.pubDate;
		if (!newest || date > newest) newest = date;
	}
	return newest;
}

/**
 * Reply `304 Not Modified` when the client already holds this version, so
 * crawlers spend no bandwidth re-downloading unchanged articles.
 */
export function conditionalNotModified(request: Request, lastModified: Date | null): Response | null {
	if (!lastModified) return null;
	const header = request.headers.get("if-modified-since");
	if (!header) return null;
	const since = Date.parse(header);
	if (Number.isNaN(since)) return null;
	// HTTP dates have second precision, so compare at that resolution.
	if (Math.floor(lastModified.getTime() / 1000) * 1000 <= since) {
		return new Response(null, {
			status: 304,
			headers: { "Last-Modified": lastModified.toUTCString() },
		});
	}
	return null;
}
