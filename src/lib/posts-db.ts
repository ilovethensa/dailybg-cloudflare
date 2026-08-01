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
	heroImage: string | null;
	draft: boolean;
};

function rowToPost(row: Record<string, unknown>): Post {
	return {
		slug: row.slug as string,
		title: row.title as string,
		excerpt: (row.excerpt as string) ?? null,
		body: row.body as string,
		html: marked.parse(row.body as string) as string,
		pubDate: new Date((row.pub_date as number) * 1000),
		updatedDate: row.updated_date ? new Date((row.updated_date as number) * 1000) : null,
		category: (row.category as string) ?? null,
		tags: JSON.parse((row.tags as string) ?? "[]"),
		author: (row.author as string) ?? null,
		heroImage: (row.hero_image as string) ?? null,
		draft: (row.draft as number) !== 0,
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
