import type { APIRoute } from "astro";
import { getPostBySlug, updatePost, deletePost } from "../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
	const slug = context.params.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const post = await getPostBySlug(slug);
	if (!post) {
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify(post), {
		headers: { "Content-Type": "application/json" },
	});
};

export const PUT: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	const slug = context.params.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid JSON" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { title, body: content, excerpt, category, tags, author, hero_image, draft } = body as Record<string, unknown>;

	const post = await updatePost(slug, {
		title: title as string | undefined,
		body: content as string | undefined,
		excerpt: excerpt as string | undefined,
		category: category as string | undefined,
		tags: tags as string[] | undefined,
		author: author as string | undefined,
		hero_image: hero_image as string | undefined,
		draft: draft as number | undefined,
	});

	if (!post) {
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify(post), {
		headers: { "Content-Type": "application/json" },
	});
};

export const DELETE: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	const slug = context.params.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const deleted = await deletePost(slug);
	if (!deleted) {
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ ok: true }), {
		headers: { "Content-Type": "application/json" },
	});
};
