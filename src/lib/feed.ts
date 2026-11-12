import rss from "@astrojs/rss";
import type { Post } from "./posts-db";

const escapeXml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

type FeedOptions = {
	site: URL;
	title: string;
	description: string;
	posts: Post[];
	/** Path of the feed itself, advertised as the RSS self link. */
	feedPath: string;
	/** Page this feed covers (defaults to the site root). */
	linkPath?: string;
};

/**
 * Build an RSS 2.0 feed with the per-item metadata news aggregators expect:
 * author, category and a hero-image enclosure. Links are resolved against the
 * site root, so callers only pass post slugs.
 */
export async function buildFeed({ site, title, description, posts, feedPath, linkPath }: FeedOptions) {
	const lastBuild = posts[0]?.pubDate ?? new Date();

	// @astrojs/rss is async; awaiting it is required or the response body is empty.
	return await rss({
		title,
		description,
		site,
		xmlns: { atom: "http://www.w3.org/2005/Atom" },
		// Aggregators key off an explicit self link, so declare the feed URL.
		customData: [
			"<language>bg-BG</language>",
			linkPath ? `<link>${escapeXml(new URL(linkPath, site).href)}</link>` : "",
			`<lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>`,
			`<atom:link href="${escapeXml(new URL(feedPath, site).href)}" rel="self" type="application/rss+xml" />`,
		].join(""),
		items: posts.map((post) => {
			const image = post.heroImage ? new URL(post.heroImage, site).href : null;
			return {
				title: post.title,
				description: post.excerpt ?? "",
				pubDate: post.pubDate,
				link: `/posts/${post.slug}`,
				customData: [
					post.author ? `<author>${escapeXml(post.author)}</author>` : "",
					post.category ? `<category>${escapeXml(post.category)}</category>` : "",
					image ? `<enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />` : "",
				].join(""),
			};
		}),
	});
}

/** Wrap a feed response with a shared, short-lived cache policy. */
export function feedResponse(body: Response): Response {
	return new Response(body.body, {
		status: body.status,
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=1800",
		},
	});
}
