import type { APIRoute } from "astro";
import { getStats } from "../../../lib/posts-db";

export const prerender = false;

export const GET: APIRoute = async () => {
	const stats = await getStats();
	return new Response(JSON.stringify(stats), {
		headers: { "Content-Type": "application/json" },
	});
};
