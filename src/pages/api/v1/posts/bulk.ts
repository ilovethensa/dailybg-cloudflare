import type { APIRoute } from "astro";
import { bulkAction } from "../../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../../lib/api-auth";
import { badRequest } from "../../../../lib/api-errors";

export const prerender = false;

const VALID_ACTIONS = ["publish", "unpublish", "delete"] as const;

export const POST: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return badRequest("Invalid JSON", "INVALID_BODY");
	}

	const { action, slugs } = body;

	if (!action || !VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
		return badRequest(`action must be one of: ${VALID_ACTIONS.join(", ")}`, "INVALID_BODY", ["action"]);
	}
	if (!Array.isArray(slugs) || slugs.length === 0) {
		return badRequest("slugs must be a non-empty array", "MISSING_FIELD", ["slugs"]);
	}

	const actionName = action as (typeof VALID_ACTIONS)[number];
	const results = await bulkAction({ action: actionName, slugs: slugs as string[] });

	return new Response(JSON.stringify({ results }), {
		headers: { "Content-Type": "application/json" },
	});
};
