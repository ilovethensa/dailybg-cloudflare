import { env } from "cloudflare:workers";
import { marked } from "marked";
import { tagToSlug } from "./slugs";

export type Post = {
	slug: string;
	title: string;
	excerpt: string | null;
	body: string;
	html: string;
	pubDate: Date;
	updatedDate: Date | null;
	tags: string[];
	author: string | null;
	/** Absolute URL to the hero/cover image */
	heroImage: string | null;
	draft: boolean;
	readingTime: number;
};

function rowToPost(row: Record<string, unknown>): Post {
	const body = row.body as string;
	return {
		slug: row.slug as string,
		title: row.title as string,
		excerpt: (row.excerpt as string) ?? null,
		body,
		html: marked.parse(body) as string,
		pubDate: new Date((row.pub_date as number) * 1000),
		updatedDate: row.updated_date ? new Date((row.updated_date as number) * 1000) : null,
		tags: JSON.parse((row.tags as string) ?? "[]"),
		author: (row.author as string) ?? null,
		heroImage: (row.hero_image as string) ?? null,
		draft: (row.draft as number) !== 0,
		readingTime: getReadingTime(body),
	};
}

/**
 * Convert an internal `Post` (dates as `Date`) into the API-facing JSON shape
 * with ISO-string dates, matching the canonical schema in API.md.
 */
export function serializePost(post: Post) {
	return {
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		body: post.body,
		html: post.html,
		pubDate: post.pubDate.toISOString(),
		updatedDate: post.updatedDate ? post.updatedDate.toISOString() : null,
		tags: post.tags,
		author: post.author,
		heroImage: post.heroImage,
		draft: post.draft,
		readingTime: post.readingTime,
	};
}

/**
 * Convert a `Post` into the list/summary JSON shape (no `body`/`html`).
 */
export function serializePostSummary(post: Post) {
	return {
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		pubDate: post.pubDate.toISOString(),
		updatedDate: post.updatedDate ? post.updatedDate.toISOString() : null,
		tags: post.tags,
		author: post.author,
		heroImage: post.heroImage,
		draft: post.draft,
		readingTime: post.readingTime,
	};
}

export async function getAllPosts(): Promise<Post[]> {
	const db = env.DB;
	if (!db) return [];
	const { results } = await db.prepare("SELECT * FROM posts WHERE draft = 0 ORDER BY pub_date DESC").all<Record<string, unknown>>();
	return (results ?? []).map(rowToPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
	const db = env.DB;
	if (!db) return null;
	const row = await db.prepare("SELECT * FROM posts WHERE slug = ?1").bind(slug).first<Record<string, unknown>>();
	if (!row) return null;
	return rowToPost(row);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
	const db = env.DB;
	if (!db) return [];
	const { results } = await db
		.prepare("SELECT * FROM posts WHERE draft = 0 AND tags LIKE ?1 ORDER BY pub_date DESC")
		.bind(`%"${tag}"%`)
		.all<Record<string, unknown>>();
	return (results ?? []).map(rowToPost);
}

/** Find posts whose tags slugify to the given URL slug (handles Cyrillic tags). */
export async function getPostsByTagSlug(slug: string): Promise<Post[]> {
	const db = env.DB;
	if (!db) return [];
	const { results } = await db
		.prepare("SELECT * FROM posts WHERE draft = 0 ORDER BY pub_date DESC")
		.all<Record<string, unknown>>();
	const wanted = tagToSlug(slug);
	return (results ?? [])
		.map(rowToPost)
		.filter((post) => post.tags.some((tag) => tagToSlug(tag) === wanted));
}

export async function searchPosts(query: string): Promise<Post[]> {
	const db = env.DB;
	if (!db) return [];
	const q = `%${query.toLowerCase()}%`;
	const { results } = await db
		.prepare("SELECT * FROM posts WHERE draft = 0 AND (LOWER(title) LIKE ?1 OR LOWER(excerpt) LIKE ?1 OR LOWER(body) LIKE ?1) ORDER BY pub_date DESC")
		.bind(q)
		.all<Record<string, unknown>>();
	return (results ?? []).map(rowToPost);
}

export function getUniqueTags(posts: Post[]): string[] {
	const tagSet = new Set<string>();
	for (const post of posts) {
		for (const tag of post.tags) {
			tagSet.add(tag);
		}
	}
	return Array.from(tagSet).sort();
}

export interface PostSummary {
	id: string;
	href: string;
	title: string;
	excerpt: string | null;
	/** Absolute URL to the hero/cover image */
	image: string | undefined;
	tags: Array<{ slug: string; label: string }>;
	readingTime: number;
	author: string | undefined;
	date: Date;
}

export function toPostSummary(post: Post): PostSummary {
	return {
		id: post.slug,
		href: `/posts/${post.slug}`,
		title: post.title,
		excerpt: post.excerpt,
		image: post.heroImage ?? undefined,
		tags: post.tags.map((tag) => ({ slug: tagToSlug(tag), label: tag })),
		readingTime: getReadingTime(post.body),
		author: post.author ?? undefined,
		date: post.pubDate,
	};
}

/* ------------------------------------------------------------------ */
/* v1 API data layer                                                   */
/* ------------------------------------------------------------------ */

export type PostStatus = "published" | "draft" | "all";

export type ListPostsOptions = {
	page?: number;
	limit?: number;
	status?: PostStatus;
	tag?: string;
	author?: string;
	q?: string;
	sort?: "-pubDate" | "pubDate" | "title" | "-updatedDate";
	from?: string;
	to?: string;
};

export type PaginatedPosts = {
	data: ReturnType<typeof serializePostSummary>[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
};

const LIST_SORT_COLUMNS: Record<NonNullable<ListPostsOptions["sort"]>, string> = {
	"-pubDate": "pub_date DESC",
	pubDate: "pub_date ASC",
	title: "title ASC",
	"-updatedDate": "COALESCE(updated_date, pub_date) DESC",
};

export async function listPosts(opts: ListPostsOptions = {}): Promise<PaginatedPosts> {
	const db = env.DB;
	if (!db) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

	const page = Math.max(1, Math.floor(opts.page ?? 1) || 1);
	const limit = Math.min(100, Math.max(1, Math.floor(opts.limit ?? 20) || 20));
	const status = opts.status ?? "published";

	const where: string[] = [];
	const binds: unknown[] = [];
	let i = 0;
	const next = () => `?${++i}`;

	if (status === "published") where.push("draft = 0");
	else if (status === "draft") where.push("draft != 0");

	if (opts.author) {
		where.push(`author = ${next()}`);
		binds.push(opts.author);
	}
	if (opts.tag) {
		where.push(`tags LIKE ${next()}`);
		binds.push(`%"${opts.tag}"%`);
	}
	if (opts.q) {
		const q = `%${opts.q.toLowerCase()}%`;
		where.push(`(LOWER(title) LIKE ${next()} OR LOWER(excerpt) LIKE ${next()} OR LOWER(body) LIKE ${next()})`);
		binds.push(q, q, q);
	}
	if (opts.from) {
		const ts = isoToUnix(opts.from);
		if (ts !== null) {
			where.push(`pub_date >= ${next()}`);
			binds.push(ts);
		}
	}
	if (opts.to) {
		const ts = isoToUnix(opts.to);
		if (ts !== null) {
			where.push(`pub_date <= ${next()}`);
			binds.push(ts);
		}
	}

	const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
	const orderSql = LIST_SORT_COLUMNS[opts.sort ?? "-pubDate"];

	const countRow = await db
		.prepare(`SELECT COUNT(*) AS c FROM posts ${whereSql}`)
		.bind(...binds)
		.first<{ c: number }>();
	const total = countRow?.c ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / limit));

	const { results } = await db
		.prepare(`SELECT * FROM posts ${whereSql} ORDER BY ${orderSql} LIMIT ${limit} OFFSET ${(page - 1) * limit}`)
		.bind(...binds)
		.all<Record<string, unknown>>();

	const data = (results ?? []).map(rowToPost).map(serializePostSummary);
	return { data, pagination: { page, limit, total, totalPages } };
}

export type CreatePostInput = {
	slug: string;
	title: string;
	body: string;
	pubDate?: string;
	excerpt?: string;
	tags?: string[];
	author?: string;
	heroImage?: string;
	draft?: boolean;
};

export async function createPost(input: CreatePostInput): Promise<Post | null> {
	const db = env.DB;
	if (!db) return null;

	const pubDate = input.pubDate ? isoToUnix(input.pubDate) : null;
	const pub_date = pubDate ?? Math.floor(Date.now() / 1000);

	await db
		.prepare(
			`INSERT INTO posts (slug, title, excerpt, body, pub_date, updated_date, tags, author, hero_image, draft)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
		)
		.bind(
			input.slug,
			input.title,
			input.excerpt ?? null,
			input.body,
			pub_date,
			null,
			JSON.stringify(input.tags ?? []),
			input.author ?? null,
			input.heroImage ?? null,
			input.draft === false ? 0 : 1,
		)
		.run();
	return getPostBySlug(input.slug);
}

export type UpdatePostInput = {
	title?: string;
	body?: string;
	excerpt?: string;
	tags?: string[];
	author?: string;
	heroImage?: string;
	draft?: boolean;
	pubDate?: string;
};

export async function updatePost(
	slug: string,
	updates: UpdatePostInput,
	opts: { bumpUpdated?: boolean } = {},
): Promise<Post | null> {
	const db = env.DB;
	if (!db) return null;
	const existing = await db.prepare("SELECT * FROM posts WHERE slug = ?1").bind(slug).first();
	if (!existing) return null;

	const fields: string[] = [];
	const values: unknown[] = [];
	let i = 1;

	if (updates.title !== undefined) { fields.push(`title = ?${++i}`); values.push(updates.title); }
	if (updates.body !== undefined) { fields.push(`body = ?${++i}`); values.push(updates.body); }
	if (updates.excerpt !== undefined) { fields.push(`excerpt = ?${++i}`); values.push(updates.excerpt); }
	if (updates.tags !== undefined) { fields.push(`tags = ?${++i}`); values.push(JSON.stringify(updates.tags)); }
	if (updates.author !== undefined) { fields.push(`author = ?${++i}`); values.push(updates.author); }
	if (updates.heroImage !== undefined) { fields.push(`hero_image = ?${++i}`); values.push(updates.heroImage); }
	if (updates.draft !== undefined) { fields.push(`draft = ?${++i}`); values.push(updates.draft ? 1 : 0); }
	if (updates.pubDate !== undefined) {
		const ts = isoToUnix(updates.pubDate);
		if (ts !== null) { fields.push(`pub_date = ?${++i}`); values.push(ts); }
	}

	if (fields.length === 0) return getPostBySlug(slug);

	if (opts.bumpUpdated !== false) {
		fields.push(`updated_date = ?${++i}`);
		values.push(Math.floor(Date.now() / 1000));
	}

	await db.prepare(`UPDATE posts SET ${fields.join(", ")} WHERE slug = ?1`).bind(slug, ...values).run();
	return getPostBySlug(slug);
}

export async function renamePost(slug: string, newSlug: string): Promise<Post | null> {
	const db = env.DB;
	if (!db) return null;
	const existing = await db.prepare("SELECT * FROM posts WHERE slug = ?1").bind(slug).first();
	if (!existing) return null;
	if (slug === newSlug) return getPostBySlug(slug);
	const clash = await db.prepare("SELECT 1 FROM posts WHERE slug = ?1").bind(newSlug).first();
	if (clash) return null;
	await db.prepare("UPDATE posts SET slug = ?1 WHERE slug = ?2").bind(newSlug, slug).run();
	return getPostBySlug(newSlug);
}

export async function deletePost(slug: string): Promise<boolean> {
	const db = env.DB;
	if (!db) return false;
	const result = await db.prepare("DELETE FROM posts WHERE slug = ?1").bind(slug).run();
	return (result.meta?.changes ?? 0) > 0;
}

export type BulkActionResult = { slug: string; ok: boolean; error?: string };

export type BulkAction =
	| { action: "publish" | "unpublish" | "delete"; slugs: string[] };

export async function bulkAction(action: BulkAction): Promise<BulkActionResult[]> {
	const db = env.DB;
	if (!db) return (action.slugs ?? []).map((slug) => ({ slug, ok: false, error: "no_db" }));

	const results: BulkActionResult[] = [];
	for (const slug of action.slugs ?? []) {
		try {
			let ok = false;
			if (action.action === "publish") {
				ok = (await db.prepare("UPDATE posts SET draft = 0, updated_date = ?1 WHERE slug = ?2").bind(Math.floor(Date.now() / 1000), slug).run()).meta?.changes > 0;
			} else if (action.action === "unpublish") {
				ok = (await db.prepare("UPDATE posts SET draft = 1, updated_date = ?1 WHERE slug = ?2").bind(Math.floor(Date.now() / 1000), slug).run()).meta?.changes > 0;
			} else if (action.action === "delete") {
				ok = (await db.prepare("DELETE FROM posts WHERE slug = ?1").bind(slug).run()).meta?.changes > 0;
			}
			results.push(ok ? { slug, ok: true } : { slug, ok: false, error: "not_found" });
		} catch (e) {
			results.push({ slug, ok: false, error: "error" });
		}
	}
	return results;
}

export type TaxonomyEntry = { name: string; count: number };

export async function getTags(): Promise<TaxonomyEntry[]> {
	const db = env.DB;
	if (!db) return [];
	const { results } = await db
		.prepare("SELECT tags FROM posts WHERE draft = 0 AND tags IS NOT NULL")
		.all<{ tags: string }>();
	const counts = new Map<string, number>();
	for (const row of results ?? []) {
		let parsed: string[] = [];
		try {
			parsed = JSON.parse(row.tags ?? "[]");
		} catch {
			parsed = [];
		}
		for (const tag of parsed) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export type Stats = {
	total: number;
	published: number;
	drafts: number;
	byMonth: { month: string; count: number }[];
};

export async function getStats(): Promise<Stats> {
	const db = env.DB;
	if (!db) return { total: 0, published: 0, drafts: 0, byMonth: [] };
	const total = (await db.prepare("SELECT COUNT(*) AS c FROM posts").first<{ c: number }>())?.c ?? 0;
	const published = (await db.prepare("SELECT COUNT(*) AS c FROM posts WHERE draft = 0").first<{ c: number }>())?.c ?? 0;
	const drafts = (await db.prepare("SELECT COUNT(*) AS c FROM posts WHERE draft != 0").first<{ c: number }>())?.c ?? 0;
	const byMonthRows = await db
		.prepare("SELECT strftime('%Y-%m', datetime(pub_date, 'unixepoch')) AS month, COUNT(*) AS count FROM posts GROUP BY month ORDER BY month DESC")
		.all<{ month: string; count: number }>();
	return {
		total,
		published,
		drafts,
		byMonth: (byMonthRows?.results ?? []).map((r) => ({ month: r.month, count: r.count })),
	};
}

function isoToUnix(iso: string): number | null {
	const ms = Date.parse(iso);
	if (Number.isNaN(ms)) return null;
	return Math.floor(ms / 1000);
}

function getReadingTime(markdown: string): number {
	const WORDS_PER_MINUTE = 200;
	const CJK_CHARACTERS_PER_MINUTE = 500;
	const WHITESPACE_REGEX = /\s+/;
	const CJK_CHARACTER_REGEX =
		/\p{Script=Han}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}/gu;

	const text = markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_|~\-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (!text) return 1;

	const cjkCharacterCount = text.match(CJK_CHARACTER_REGEX)?.length ?? 0;
	const wordCount = text.replace(CJK_CHARACTER_REGEX, " ").split(WHITESPACE_REGEX).filter(Boolean).length;
	const minutes = Math.ceil(
		wordCount / WORDS_PER_MINUTE + cjkCharacterCount / CJK_CHARACTERS_PER_MINUTE,
	);
	return Math.max(1, minutes);
}
