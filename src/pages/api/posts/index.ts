import type { APIRoute } from "astro";
import { getAllPosts, insertPost } from "../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async () => {
	const posts = await getAllPosts();
	return new Response(JSON.stringify(posts), {
		headers: { "Content-Type": "application/json" },
	});
};

export const POST: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid JSON" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { slug, title, body: content, excerpt, category, tags, author, hero_image, draft } = body as Record<string, unknown>;

	if (!slug || !title || !content) {
		return new Response(JSON.stringify({ error: "slug, title, and body are required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const pub_date = Math.floor(Date.now() / 1000);

	const post = await insertPost({
		slug: slug as string,
		title: title as string,
		body: content as string,
		pub_date,
		excerpt: excerpt as string | undefined,
		category: category as string | undefined,
		tags: tags as string[] | undefined,
		author: author as string | undefined,
		hero_image: hero_image as string | undefined,
		draft: (draft as number) ?? 1,
	});

	return new Response(JSON.stringify(post), {
		status: 201,
		headers: { "Content-Type": "application/json" },
	});
};
