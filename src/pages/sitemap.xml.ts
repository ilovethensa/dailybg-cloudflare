import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAllPosts, getUniqueTags } from "../lib/posts-db";
import { tagToSlug } from "../lib/slugs";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site?.href?.replace(/\/$/, "") ?? "https://dailybg.org";

	const posts = await getAllPosts();
	const tags = getUniqueTags(posts);
	const pages = await getCollection("pages");

	const postUrls = posts.map(
		(post) => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${(post.updatedDate ?? post.pubDate).toISOString().split("T")[0]}</lastmod>
    <priority>0.8</priority>
  </url>`
	);

	const tagUrls = [...new Set(tags)].map((tag) => {
		const slug = tagToSlug(tag);
		return `  <url>
    <loc>${baseUrl}/tag/${slug}</loc>
    <priority>0.4</priority>
  </url>`;
	});

	const staticUrls = [
		`  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
  </url>`,
		`  <url>
    <loc>${baseUrl}/posts</loc>
    <priority>0.7</priority>
  </url>`,
		...pages.map(
			(page) => `  <url>
    <loc>${baseUrl}/pages/${page.id}/</loc>
    <priority>0.5</priority>
  </url>`
		),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${postUrls.join("\n")}
${tagUrls.join("\n")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
