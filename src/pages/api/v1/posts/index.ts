import type { APIRoute } from "astro";
import { listPosts, createPost, getPostBySlug, serializePost } from "../../../../lib/posts-db";
import { verifyApiKey, unauthorized } from "../../../../lib/api-auth";
import { badRequest, conflict } from "../../../../lib/api-errors";

export const prerender = false;

function parseQuery(context: any) {
	const sp = context.url.searchParams;
	const num = (key: string) => {
		const v = sp.get(key);
		if (v === null) return undefined;
		const n = Number(v);
		return Number.isFinite(n) ? n : undefined;
	};
	const str = (key: string) => {
		const v = sp.get(key);
		return v === null ? undefined : v;
	};
	const sort = str("sort");
	const validSort = ["-pubDate", "pubDate", "title", "-updatedDate"] as const;
	return {
		page: num("page"),
		limit: num("limit"),
		status: str("status") as "published" | "draft" | "all" | undefined,
		tag: str("tag"),
		author: str("author"),
		q: str("q"),
		sort: validSort.includes(sort as any) ? (sort as (typeof validSort)[number]) : undefined,
		from: str("from"),
		to: str("to"),
	};
}

export const GET: APIRoute = async (context) => {
	const result = await listPosts(parseQuery(context));
	return new Response(JSON.stringify(result), {
		headers: { "Content-Type": "application/json" },
	});
};

export const POST: APIRoute = async (context) => {
	if (!verifyApiKey(context)) return unauthorized();

	let body: Record<string, unknown>;
	try {
		body = await context.request.json();
	} catch {
		return badRequest("Invalid JSON", "INVALID_BODY");
	}

	const { slug, title, body: content, excerpt, tags, author, heroImage, draft, pubDate } = body;

	if (!slug || !title || !content) {
		const missing: string[] = [];
		if (!slug) missing.push("slug");
		if (!title) missing.push("title");
		if (!content) missing.push("body");
		return badRequest("slug, title, and body are required", "MISSING_FIELD", missing);
	}
	if (typeof slug !== "string" || !/^[a-z0-9-]+$/i.test(slug)) {
		return badRequest("slug must contain only letters, numbers, and hyphens", "INVALID_SLUG", ["slug"]);
	}

	const clash = await getPostBySlug(slug as string);
	if (clash) return conflict(`Post with slug "${slug}" already exists`);

	const post = await createPost({
		slug: slug as string,
		title: title as string,
		body: content as string,
		pubDate: pubDate as string | undefined,
		excerpt: excerpt as string | undefined,
		tags: tags as string[] | undefined,
		author: author as string | undefined,
		heroImage: heroImage as string | undefined,
		draft: draft === undefined ? true : Boolean(draft),
	});

	if (!post) return badRequest("Could not create post", "INVALID_BODY");

	return new Response(JSON.stringify(serializePost(post)), {
		status: 201,
		headers: { "Content-Type": "application/json" },
	});
};
