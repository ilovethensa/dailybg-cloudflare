import { getViews, incrementViews } from "../../../lib/db";

export const prerender = false;

export async function GET({ params }: { params: { slug: string } }) {
	const views = await getViews(params.slug);
	return new Response(JSON.stringify({ views }), {
		headers: { "Content-Type": "application/json" },
	});
}

export async function POST({ params }: { params: { slug: string } }) {
	const views = await incrementViews(params.slug);
	return new Response(JSON.stringify({ views }), {
		headers: { "Content-Type": "application/json" },
	});
}
