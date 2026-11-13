import { defineMiddleware } from "astro:middleware";

/**
 * Cache stable, public GET responses at the edge. These routes are read-only
 * and identical for every visitor, so re-rendering them (and re-reading D1)
 * on every request only burns Worker CPU.
 *
 * Only a small allow-list is cached; authenticated routes, search and article
 * pages with conditional requests are left untouched.
 */
const CACHE_TTL_SECONDS = 60;

const CACHEABLE_PATHS = [
	/^\/$/,
	/^\/posts\/?$/,
	/^\/category\/[^/]+\/?$/,
	/^\/tag\/[^/]+\/?$/,
	/^\/rss\.xml$/,
	/^\/sitemap(?:-news|-images)?\.xml$/,
	/^\/api\/v1\/posts$/,
	/^\/api\/v1\/posts\/featured$/,
	/^\/api\/v1\/tags$/,
	/^\/api\/v1\/stats$/,
];

export const onRequest = defineMiddleware(async (context, next) => {
	const { request } = context;
	if (request.method !== "GET") return next();

	const url = new URL(request.url);
	if (!CACHEABLE_PATHS.some((pattern) => pattern.test(url.pathname))) return next();
	// `caches` is a Workers global; guard so `astro dev` keeps working.
	if (typeof caches === "undefined") return next();

	const cache = (caches as unknown as { default: Cache }).default;
	const cacheKey = new Request(url.toString(), { method: "GET" });
	const hit = await cache.match(cacheKey);
	if (hit) return hit;

	const response = await next();
	// Never cache errors, redirects or per-visitor responses.
	if (response.status !== 200 || response.headers.has("Set-Cookie")) return response;

	const headers = new Headers(response.headers);
	headers.set(
		"Cache-Control",
		`public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=300`,
	);
	const body = await response.arrayBuffer();
	const cacheable = new Response(body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
	await cache.put(cacheKey, cacheable.clone());
	return cacheable;
});
