import type { APIRoute } from "astro";
import { getPostBySlug, renamePost, serializePost } from "../../../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../../../lib/api-auth";
import { badRequest, conflict, notFound } from "../../../../../lib/api-errors";

export const prerender = false;

export const POST: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	const slug = context.params.slug;
	if (!slug) return badRequest("Missing slug", "MISSING_FIELD", ["slug"]);

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return badRequest("Invalid JSON", "INVALID_BODY");
	}

	const { newSlug } = body;
	if (!newSlug || typeof newSlug !== "string") {
		return badRequest("newSlug is required", "MISSING_FIELD", ["newSlug"]);
	}
	if (!/^[a-z0-9-]+$/i.test(newSlug)) {
		return badRequest("newSlug must contain only letters, numbers, and hyphens", "INVALID_SLUG", ["newSlug"]);
	}

	const existing = await getPostBySlug(slug);
	if (!existing) return notFound();

	if (newSlug !== slug) {
		const clash = await getPostBySlug(newSlug);
		if (clash) return conflict(`Post with slug "${newSlug}" already exists`);
	}

	const post = await renamePost(slug, newSlug);
	if (!post) return conflict(`Post with slug "${newSlug}" already exists`);

	return new Response(JSON.stringify(serializePost(post)), {
		headers: { "Content-Type": "application/json" },
	});
};
