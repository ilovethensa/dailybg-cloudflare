/**
 * Responsive image sources for hero images stored in D1.
 *
 * Wikimedia Commons is special-cased. Its production CDN rejects direct
 * hotlinks that are not one of a fixed set of thumbnail widths (T414805), and
 * rejects requests that do not look like an image fetch at all. Serving its
 * pre-generated thumbnails needs no server-side transform, so those images
 * never touch `/_image`.
 */

/** Widths Wikimedia production will generate on demand. */
const WIKIMEDIA_STEPS = [250, 330, 500, 960, 1280, 1920] as const;

export type ImageSources = {
	src: string;
	srcset?: string;
};

/** Nearest allowed step: the grid is coarse (500 → 960), so rounding up would
 *  make a 640 px slot download a 960 px thumbnail for no visible gain. */
function stepFor(width: number): number {
	return WIKIMEDIA_STEPS.reduce((best, step) =>
		Math.abs(step - width) < Math.abs(best - width) ? step : best,
	);
}

/**
 * Build a responsive thumbnail set for an `upload.wikimedia.org` file, or
 * `null` when the URL is not a plain Commons/MediaWiki original.
 */
export function wikimediaSources(src: string, widths: number[]): ImageSources | null {
	let url: URL;
	try {
		url = new URL(src);
	} catch {
		return null;
	}
	if (url.hostname !== "upload.wikimedia.org") return null;
	// Already a thumbnail: serve it untouched rather than asking the image
	// service to re-fetch a URL Wikimedia will reject.
	if (url.pathname.includes("/thumb/")) return { src };

	const match = url.pathname.match(/^\/wikipedia\/([^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/);
	if (!match) return null;

	const [, project, first, second, file] = match;
	const lower = file.toLowerCase();
	const ext = lower.slice(lower.lastIndexOf("."));
	// Thumbnails of vector and TIFF sources are rasterised under a new extension.
	const suffix = ext === ".svg" ? ".png" : ext === ".tif" || ext === ".tiff" ? ".jpg" : "";

	const base = `https://upload.wikimedia.org/wikipedia/${project}/thumb/${first}/${second}/${file}`;
	const steps = [
		...new Set(widths.map(stepFor)),
	].sort((a, b) => a - b);

	return {
		src: `${base}/${steps[steps.length - 1]}px-${file}${suffix}`,
		srcset: steps.map((step) => `${base}/${step}px-${file}${suffix} ${step}w`).join(", "),
	};
}
