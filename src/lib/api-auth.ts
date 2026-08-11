import type { APIContext } from "astro";

const API_KEY = "dailybg-secret-key-2024";

export function verifyApiKey(context: APIContext): boolean {
	const auth = context.request.headers.get("Authorization");
	return auth === `Bearer ${API_KEY}`;
}

export function unauthorized(): Response {
	return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: { "Content-Type": "application/json" },
	});
}
