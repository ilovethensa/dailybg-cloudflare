import type { APIRoute } from "astro";
import { getCategoryBySlug } from "../../../lib/categories";
import { getPostsByCategorySlug } from "../../../lib/posts-db";
import { buildFeed, feedResponse } from "../../../lib/feed";

export const prerender = false;

export const GET: APIRoute = async ({ params, site }) => {
	const category = getCategoryBySlug(params.slug);
	if (!category) return new Response("Not found", { status: 404 });

	const posts = await getPostsByCategorySlug(category.slug);

	return feedResponse(
		await buildFeed({
			site: site ?? new URL("https://dailybg.org"),
			title: `${category.label} — dailyBG`,
			description: `Последни новини в рубрика ${category.label} — ежедневна независима журналистика от dailyBG.`,
			posts,
			feedPath: `/category/${category.slug}/feed.xml`,
			linkPath: `/category/${category.slug}`,
		}),
	);
};
