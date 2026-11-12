import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAllPosts, getUniqueTags } from "../lib/posts-db";
import { CATEGORIES, categoryToSlug } from "../lib/categories";
import { tagToSlug } from "../lib/slugs";
import { MIN_ARCHIVE_POSTS } from "../lib/seo";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site?.href?.replace(/\/$/, "") ?? "https://dailybg.org";

	const posts = await getAllPosts();
	const tags = getUniqueTags(posts);
	const pages = await getCollection("pages");

	const latestPostDate = posts[0]?.updatedDate ?? posts[0]?.pubDate ?? null;
	const lastmod = (date: Date | null) => (date ? `<lastmod>${date.toISOString()}</lastmod>` : "");

	const postUrls = posts.map(
		(post) => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    ${lastmod(post.updatedDate ?? post.pubDate)}
    <priority>0.8</priority>
  </url>`,
	);

	// Count posts per tag so thin archives (which render noindex) stay out of
	// the sitemap instead of being submitted as indexable URLs.
	const tagCounts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
	}

	const tagUrls = [...new Set(tags)]
		.filter((tag) => (tagCounts.get(tag) ?? 0) >= MIN_ARCHIVE_POSTS)
		.map((tag) => {
			const slug = tagToSlug(tag);
			return `  <url>
    <loc>${baseUrl}/tag/${slug}</loc>
    <priority>0.4</priority>
  </url>`;
		});

	const categoryUrls = CATEGORIES.flatMap((category) => {
		const inCategory = posts.filter(
			(post) => post.category && categoryToSlug(post.category) === category.slug,
		);
		// Empty categories are served noindex, so omit them here too.
		if (inCategory.length === 0) return [];
		const newest = inCategory[0];
		return [
			`  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    ${lastmod(newest?.updatedDate ?? newest?.pubDate ?? null)}
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`,
		];
	});

	const staticUrls = [
		`  <url>
    <loc>${baseUrl}/</loc>
    ${lastmod(latestPostDate)}
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`,
		`  <url>
    <loc>${baseUrl}/posts</loc>
    <priority>0.6</priority>
  </url>`,
		...pages.map(
			(page) => `  <url>
    <loc>${baseUrl}/pages/${page.id}/</loc>
    <priority>0.3</priority>
  </url>`,
		),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${categoryUrls.join("\n")}
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
