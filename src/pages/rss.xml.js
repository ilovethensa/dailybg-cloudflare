import { buildFeed, feedResponse } from "../lib/feed";
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_TITLE } from "../consts";
import { getAllPosts } from "../lib/posts-db";

export const prerender = false;

/** Most recent articles carried by the feed. */
const FEED_LIMIT = 50;

export async function GET(context) {
	const posts = await getAllPosts();
	return feedResponse(
		await buildFeed({
			site: context.site ?? new URL("https://dailybg.org"),
			title: `${SITE_TITLE} — ${SITE_TAGLINE}`,
			description: SITE_DESCRIPTION,
			posts: posts.slice(0, FEED_LIMIT),
			feedPath: "/rss.xml",
		}),
	);
}
