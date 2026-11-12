import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts-db";

export const prerender = false;

const escapeXml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site?.href?.replace(/\/$/, "") ?? "https://dailybg.org";

	const urls = (await getAllPosts())
		.filter((post) => post.heroImage)
		.map((post) => {
			const image = new URL(post.heroImage as string, `${baseUrl}/`).href;
			return `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
      ${post.excerpt ? `<image:caption>${escapeXml(post.excerpt)}</image:caption>` : ""}
    </image:image>
  </url>`;
		});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
