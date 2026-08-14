import { env } from "cloudflare:workers";
import { marked } from "marked";

export type Post = {
	slug: string;
	title: string;
	excerpt: string | null;
	body: string;
	html: string;
	pubDate: Date;
	updatedDate: Date | null;
	category: string | null;
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
		category: (row.category as string) ?? null,
		tags: JSON.parse((row.tags as string) ?? "[]"),
		author: (row.author as string) ?? null,
		heroImage: (row.hero_image as string) ?? null,
		draft: (row.draft as number) !== 0,
		readingTime: getReadingTime(body),
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

export async function getPostsByCategory(category: string): Promise<Post[]> {
	const db = env.DB;
	if (!db) return [];
	const { results } = await db
		.prepare("SELECT * FROM posts WHERE draft = 0 AND category = ?1 ORDER BY pub_date DESC")
		.bind(category)
		.all<Record<string, unknown>>();
	return (results ?? []).map(rowToPost);
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

export function getUniqueCategories(posts: Post[]): string[] {
	const catSet = new Set<string>();
	for (const post of posts) {
		if (post.category) catSet.add(post.category);
	}
	return Array.from(catSet).sort();
}

export interface PostSummary {
	id: string;
	href: string;
	title: string;
	excerpt: string | null;
	/** Absolute URL to the hero/cover image */
	image: string | undefined;
	category: { slug: string; label: string } | null;
	tags: Array<{ slug: string; label: string }>;
	readingTime: number;
	author: string | undefined;
	date: Date;
}

export function toPostSummary(post: Post): PostSummary {
	const category = post.category
		? { slug: post.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: post.category }
		: null;

	return {
		id: post.slug,
		href: `/posts/${post.slug}`,
		title: post.title,
		excerpt: post.excerpt,
		image: post.heroImage ?? undefined,
		category,
		tags: post.tags.map((tag) => ({ slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: tag })),
		readingTime: getReadingTime(post.body),
		author: post.author ?? undefined,
		date: post.pubDate,
	};
}

export async function insertPost(post: {
	slug: string;
	title: string;
	body: string;
	pub_date: number;
	excerpt?: string;
	updated_date?: number | null;
	category?: string;
	tags?: string[];
	author?: string;
	hero_image?: string;
	draft?: number;
}): Promise<Post | null> {
	const db = env.DB;
	if (!db) return null;
	await db
		.prepare(
			`INSERT INTO posts (slug, title, excerpt, body, pub_date, updated_date, category, tags, author, hero_image, draft)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
		)
		.bind(
			post.slug,
			post.title,
			post.excerpt ?? null,
			post.body,
			post.pub_date,
			post.updated_date ?? null,
			post.category ?? null,
			JSON.stringify(post.tags ?? []),
			post.author ?? null,
			post.hero_image ?? null,
			post.draft ?? 1,
		)
		.run();
	return getPostBySlug(post.slug);
}

export async function updatePost(
	slug: string,
	updates: {
		title?: string;
		body?: string;
		excerpt?: string;
		updated_date?: number;
		category?: string;
		tags?: string[];
		author?: string;
		hero_image?: string;
		draft?: number;
	},
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
	if (updates.updated_date !== undefined) { fields.push(`updated_date = ?${++i}`); values.push(updates.updated_date); }
	if (updates.category !== undefined) { fields.push(`category = ?${++i}`); values.push(updates.category); }
	if (updates.tags !== undefined) { fields.push(`tags = ?${++i}`); values.push(JSON.stringify(updates.tags)); }
	if (updates.author !== undefined) { fields.push(`author = ?${++i}`); values.push(updates.author); }
	if (updates.hero_image !== undefined) { fields.push(`hero_image = ?${++i}`); values.push(updates.hero_image); }
	if (updates.draft !== undefined) { fields.push(`draft = ?${++i}`); values.push(updates.draft); }

	if (fields.length === 0) return getPostBySlug(slug);

	// Always bump updated_date on edits
	fields.push(`updated_date = ?${++i}`);
	values.push(Math.floor(Date.now() / 1000));

	await db.prepare(`UPDATE posts SET ${fields.join(", ")} WHERE slug = ?1`).bind(slug, ...values).run();
	return getPostBySlug(slug);
}

export async function deletePost(slug: string): Promise<boolean> {
	const db = env.DB;
	if (!db) return false;
	const result = await db.prepare("DELETE FROM posts WHERE slug = ?1").bind(slug).run();
	return (result.meta?.changes ?? 0) > 0;
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
