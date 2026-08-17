import type { APIRoute } from "astro";
import { getPostBySlug, updatePost, deletePost, serializePost } from "../../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../../lib/api-auth";
import { badRequest, notFound } from "../../../../lib/api-errors";

export const prerender = false;

export const GET: APIRoute = async (context) => {
	const slug = context.params.slug;
	if (!slug) return badRequest("Missing slug", "MISSING_FIELD", ["slug"]);

	const post = await getPostBySlug(slug);
	if (!post) return notFound();

	return new Response(JSON.stringify(serializePost(post)), {
		headers: { "Content-Type": "application/json" },
	});
};

export const PATCH: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	const slug = context.params.slug;
	if (!slug) return badRequest("Missing slug", "MISSING_FIELD", ["slug"]);

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return badRequest("Invalid JSON", "INVALID_BODY");
	}

	const { title, body: content, excerpt, tags, author, heroImage, draft, pubDate, bumpUpdated } = body;

	const post = await updatePost(
		slug,
		{
			title: title as string | undefined,
			body: content as string | undefined,
			excerpt: excerpt as string | undefined,
			tags: tags as string[] | undefined,
			author: author as string | undefined,
			heroImage: heroImage as string | undefined,
			draft: draft === undefined ? undefined : Boolean(draft),
			pubDate: pubDate as string | undefined,
		},
		{ bumpUpdated: bumpUpdated === undefined ? true : Boolean(bumpUpdated) },
	);

	if (!post) return notFound();

	return new Response(JSON.stringify(serializePost(post)), {
		headers: { "Content-Type": "application/json" },
	});
};

export const DELETE: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	const slug = context.params.slug;
	if (!slug) return badRequest("Missing slug", "MISSING_FIELD", ["slug"]);

	const deleted = await deletePost(slug);
	if (!deleted) return notFound();

	return new Response(null, { status: 204 });
};
