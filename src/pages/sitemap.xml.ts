import type { APIRoute } from "astro";
import { getAllPosts, getUniqueTags } from "../lib/posts-db";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site?.href?.replace(/\/$/, "") ?? "https://dailybg.org";

	const posts = await getAllPosts();
	const tags = getUniqueTags(posts);

	const postUrls = posts.map(
		(post) => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${(post.updatedDate ?? post.pubDate).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
	);

	const tagUrls = tags.map((tag) => {
		const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
		return `  <url>
    <loc>${baseUrl}/tag/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>`;
	});

	const staticUrls = [
		`  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
		`  <url>
    <loc>${baseUrl}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`,
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
