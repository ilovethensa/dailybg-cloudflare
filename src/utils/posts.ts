import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "./reading-time";
import { slugify } from "./slugify";

export interface TagRef {
	slug: string;
	label: string;
}

export interface PostSummary {
	id: string;
	href: string;
	title: string;
	excerpt: string | null;
	image: ImageMetadata | undefined;
	category: TagRef | null;
	tags: TagRef[];
	readingTime: number;
	author: string | undefined;
	date: Date;
}

export function sortPosts(posts: CollectionEntry<"posts">[]): CollectionEntry<"posts">[] {
	return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function toPostSummary(post: CollectionEntry<"posts">): PostSummary {
	const category = post.data.category
		? { slug: slugify(post.data.category), label: post.data.category }
		: null;

	return {
		id: post.id,
		href: `/posts/${post.id}`,
		title: post.data.title,
		excerpt: post.data.excerpt ?? null,
		image: post.data.heroImage,
		category,
		tags: (post.data.tags ?? []).map((tag) => ({ slug: slugify(tag), label: tag })),
		readingTime: getReadingTime(post.body),
		author: post.data.author,
		date: post.data.pubDate,
	};
}
