/**
 * Tag slug helpers.
 *
 * Tag labels can be Bulgarian (Cyrillic) or English, so a plain
 * `[^a-z0-9]`-based slugger would collapse Cyrillic tags to empty.
 * We transliterate Cyrillic to Latin first, then slugify.
 */

const CYRILLIC_TO_LATIN: Record<string, string> = {
	а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh",
	з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n",
	о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
	х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "y",
	ю: "yu", я: "ya",
};

function transliterate(text: string): string {
	return text
		.toLowerCase()
		.split("")
		.map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
		.join("");
}

/** "Световно първенство" -> "svetovno-parvenstvo" */
export function tagToSlug(tag: string): string {
	const slug = transliterate(tag)
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return slug || "other";
}
