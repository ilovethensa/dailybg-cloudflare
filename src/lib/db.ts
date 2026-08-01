import { env } from "cloudflare:workers";
import type { D1Database } from "@cloudflare/workers-types";

export function getDb(): D1Database {
	if (!env.DB) {
		throw new Error("D1 database binding \"DB\" is not configured");
	}
	return env.DB;
}

export async function getViews(slug: string): Promise<number> {
	const db = getDb();
	const row = await db
		.prepare("SELECT count FROM page_views WHERE slug = ?1")
		.bind(slug)
		.first<{ count: number }>();
	return row?.count ?? 0;
}

export async function incrementViews(slug: string): Promise<number> {
	const db = getDb();
	await db
		.prepare(
			"INSERT INTO page_views (slug, count) VALUES (?1, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1",
		)
		.bind(slug)
		.run();
	return getViews(slug);
}

export async function getBulkViews(
	slugs: string[],
): Promise<Record<string, number>> {
	if (slugs.length === 0) return {};
	const db = getDb();
	const placeholders = slugs.map((_, i) => `?${i + 1}`).join(",");
	const rows = await db
		.prepare(`SELECT slug, count FROM page_views WHERE slug IN (${placeholders})`)
		.bind(...slugs)
		.all<{ slug: string; count: number }>();
	const result: Record<string, number> = {};
	for (const row of rows.results ?? []) {
		result[row.slug] = row.count;
	}
	return result;
}
