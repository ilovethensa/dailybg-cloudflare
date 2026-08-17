import type { APIRoute } from "astro";
import { getTags } from "../../../lib/posts-db";

export const prerender = false;

export const GET: APIRoute = async () => {
	const tags = await getTags();
	return new Response(JSON.stringify(tags), {
		headers: { "Content-Type": "application/json" },
	});
};
