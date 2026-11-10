import { tagToSlug } from "./slugs";

export type SiteCategory = {
	slug: string;
	label: string;
	/** Alternative names accepted from the API or legacy data. */
	aliases: string[];
};

/**
 * Canonical news categories, in the order they appear on the homepage.
 * `label` is the Bulgarian display name; aliases let API clients send the
 * English names as well.
 */
export const CATEGORIES: SiteCategory[] = [
	{
		slug: "local",
		label: "България",
		aliases: ["Local", "Local (Bulgarian)", "Bulgarian", "Български", "България"],
	},
	{
		slug: "europe",
		label: "Европа",
		aliases: ["Europe", "Европа"],
	},
	{
		slug: "global-south",
		label: "Глобален юг",
		aliases: ["Global south", "Global South", "Глобален юг"],
	},
	{
		slug: "international",
		label: "Международни",
		aliases: ["International", "World", "Международни", "Свят"],
	},
	{
		slug: "ukraine-war",
		label: "Война в Украйна",
		aliases: ["Ukraine war", "Ukraine", "Война в Украйна", "Украйна"],
	},
	{
		slug: "iran-war",
		label: "Война в Иран",
		aliases: ["Iran war", "Iran", "Война в Иран", "Иран"],
	},
];

const normalize = (value: string) => value.trim().toLowerCase();

export function getCategory(value: string | null | undefined): SiteCategory | undefined {
	if (!value) return undefined;
	const wanted = normalize(value);
	return CATEGORIES.find((category) =>
		[category.slug, category.label, ...category.aliases].some(
			(alias) => normalize(alias) === wanted,
		),
	);
}

export function getCategoryBySlug(slug: string | null | undefined): SiteCategory | undefined {
	if (!slug) return undefined;
	const wanted = normalize(slug);
	return CATEGORIES.find((category) => normalize(category.slug) === wanted);
}

/** Stable URL slug for any category value, including free-form legacy values. */
export function categoryToSlug(value: string): string {
	return getCategory(value)?.slug ?? tagToSlug(value);
}

/** Display label for any category value, including free-form legacy values. */
export function categoryToLabel(value: string): string {
	return getCategory(value)?.label ?? value;
}
