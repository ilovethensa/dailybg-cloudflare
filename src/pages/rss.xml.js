import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getAllPosts } from "../lib/posts-db";

export const prerender = false;

export async function GET(context) {
	const posts = await getAllPosts();
	const body = rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.excerpt,
			pubDate: post.pubDate,
			link: `/posts/${post.slug}`,
		})),
	});
	const response = new Response(body.body, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=1800",
		},
	});
	return response;
}
