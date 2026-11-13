import type { APIRoute } from "astro";
import {
	getAllPosts,
	getAllPostsFull,
	createPost,
	serializePost,
	serializePostSummary,
} from "../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../lib/api-auth";

export const prerender = false;

// Deprecated v0 list. Returns summaries by default so it no longer serialises
// every post body; `?full=1` keeps the old body+html output for old clients.
export const GET: APIRoute = async ({ url }) => {
	const full = url.searchParams.get("full") === "1";
	const posts = full
		? (await getAllPostsFull()).map(serializePost)
		: (await getAllPosts()).map(serializePostSummary);
	return new Response(JSON.stringify(posts), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
		},
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

	const post = await createPost({
		slug: slug as string,
		title: title as string,
		body: content as string,
		excerpt: excerpt as string | undefined,
		category: category as string | undefined,
		tags: tags as string[] | undefined,
		author: author as string | undefined,
		heroImage: hero_image as string | undefined,
		draft: draft === undefined ? undefined : Boolean(draft),
	});

	return new Response(JSON.stringify(post), {
		status: 201,
		headers: { "Content-Type": "application/json" },
	});
};
