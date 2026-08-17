import type { APIRoute } from "astro";
import { deletePost } from "../../../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../../../lib/api-auth";
import { badRequest, notFound } from "../../../../../lib/api-errors";

export const prerender = false;

// Alias for DELETE, which Astro blocks without an `Origin` header.
// Same semantics as `DELETE /api/v1/posts/:slug`.
export const POST: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	const slug = context.params.slug;
	if (!slug) return badRequest("Missing slug", "MISSING_FIELD", ["slug"]);

	const deleted = await deletePost(slug);
	if (!deleted) return notFound();

	return new Response(null, { status: 204 });
};
