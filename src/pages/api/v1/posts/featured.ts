import type { APIRoute } from "astro";
import { getFeaturedPosts, setFeaturedOrder, serializePostSummary } from "../../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../../lib/api-auth";
import { badRequest, validationError } from "../../../../lib/api-errors";

export const prerender = false;

/** The homepage hero block renders at most seven stories. */
const MAX_FEATURED = 7;

const json = (data: unknown) =>
	new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

export const GET: APIRoute = async () => {
	const posts = await getFeaturedPosts(MAX_FEATURED);
	return json(posts.map(serializePostSummary));
};

export const PUT: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return badRequest("Invalid JSON", "INVALID_BODY");
	}

	const { slugs } = body;
	if (!Array.isArray(slugs) || slugs.some((slug) => typeof slug !== "string")) {
		return badRequest("slugs must be an array of strings", "INVALID_BODY", ["slugs"]);
	}
	if (new Set(slugs).size !== slugs.length) {
		return badRequest("slugs must be unique", "INVALID_BODY", ["slugs"]);
	}
	if (slugs.length > MAX_FEATURED) {
		return validationError(`At most ${MAX_FEATURED} stories can be featured`, ["slugs"]);
	}

	const { missing, drafts } = await setFeaturedOrder(slugs as string[]);
	if (missing.length > 0 || drafts.length > 0) {
		const parts: string[] = [];
		if (missing.length > 0) parts.push(`unknown slugs: ${missing.join(", ")}`);
		if (drafts.length > 0) parts.push(`unpublished slugs: ${drafts.join(", ")}`);
		return validationError(parts.join("; "), [...missing, ...drafts]);
	}

	const posts = await getFeaturedPosts(MAX_FEATURED);
	return json(posts.map(serializePostSummary));
};
