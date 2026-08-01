const WORDS_PER_MINUTE = 200;
const CJK_CHARACTERS_PER_MINUTE = 500;
const WHITESPACE_REGEX = /\s+/;
const CJK_CHARACTER_REGEX =
	/\p{Script=Han}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}/gu;

/**
 * Strip Markdown/MDX syntax and return plain text from a raw source body.
 */
export function extractText(markdown: string | undefined): string {
	if (!markdown) return "";

	return markdown
		// Fenced code blocks
		.replace(/```[\s\S]*?```/g, " ")
		// Inline code
		.replace(/`[^`]*`/g, " ")
		// Images
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		// Links (keep the link text)
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		// HTML tags
		.replace(/<[^>]+>/g, " ")
		// Markdown syntax characters
		.replace(/[#>*_|~\-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Calculate reading time in minutes from a Markdown/MDX body.
 */
export function getReadingTime(markdown: string | undefined): number {
	const text = extractText(markdown);
	if (!text) return 1;

	const cjkCharacterCount = text.match(CJK_CHARACTER_REGEX)?.length ?? 0;
	const wordCount = text.replace(CJK_CHARACTER_REGEX, " ").split(WHITESPACE_REGEX).filter(Boolean).length;
	const minutes = Math.ceil(
		wordCount / WORDS_PER_MINUTE + cjkCharacterCount / CJK_CHARACTERS_PER_MINUTE,
	);
	return Math.max(1, minutes);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
	return `${minutes} min read`;
}
