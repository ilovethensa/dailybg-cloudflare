import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts-db";

export const prerender = false;

/** Google News only accepts articles published in the last 48 hours. */
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;
/** The Google News sitemap spec caps a single sitemap at 1,000 URLs. */
const MAX_URLS = 1000;

const escapeXml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site?.href?.replace(/\/$/, "") ?? "https://dailybg.org";
	const cutoff = Date.now() - NEWS_WINDOW_MS;

	const posts = (await getAllPosts())
		.filter((post) => post.pubDate.getTime() >= cutoff)
		.slice(0, MAX_URLS);

	const urls = posts.map(
		(post) => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>dailyBG</news:name>
        <news:language>bg</news:language>
      </news:publication>
      <news:publication_date>${post.pubDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`,
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=900",
		},
	});
};
