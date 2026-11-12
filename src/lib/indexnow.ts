/**
 * IndexNow (Bing/Yandex/Seznam) submission. Publishing a post pings the
 * endpoint so search engines can pick it up without waiting for a crawl.
 *
 * The key is public by design: it is served from `public/<KEY>.txt` and must
 * match the value sent here. Failures are non-fatal — the post is already saved.
 */

const INDEXNOW_KEY = "d4c1a8f6e2b94c07a5f3d8e61c2b9057";
export const SITE_ORIGIN = "https://dailybg.org";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 2000;

export async function notifyIndexNow(urls: string[]): Promise<void> {
	const urlList = urls.filter(Boolean);
	if (urlList.length === 0) return;

	try {
		await fetch(ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json; charset=utf-8" },
			body: JSON.stringify({
				host: new URL(SITE_ORIGIN).host,
				key: INDEXNOW_KEY,
				keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
				urlList,
			}),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch {
		// Search engine notification is best-effort; never fail a publish on it.
	}
}
