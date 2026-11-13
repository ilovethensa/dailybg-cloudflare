// @ts-check

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://dailybg.org",
	image: {
		layout: "constrained",
		responsiveStyles: true,
		// Hero images live on third-party news sites. Only hosts listed here can
		// be downloaded, resized and re-encoded by the image service; anything
		// else falls back to the original file (see PostImage.astro). Keep in
		// sync when a new image source starts appearing in D1.
		remotePatterns: [
			"upload.wikimedia.org",
			"bntnews.bg",
			"www.bntnews.bg",
			"www.investor.bg",
			"sportal365images.com",
			"cache1.24chasa.bg",
			"cdn4.focus.bg",
			"manager.bg",
			"m.netinfo.bg",
			"www.economic.bg",
			"eurocom.bg",
			"bloombergtv.bg",
			"www.bloombergtv.bg",
			"rent-an-apartment.info",
			"cdn.marica.bg",
			"webnews.bg",
			"cdn.btv.bg",
			"nstatic.nova.bg",
			"38picres.cgtn.com",
			"static.dir.bg",
			"img.dnevnik.bg",
			"www.climateka.bg",
			"dims.apnews.com",
			"static.bnr.bg",
			"cdn.actualno.eu",
			"placehold.co",
			"www.aljazeera.com",
			"aljazeera.com",
		].map((hostname) => ({ protocol: "https", hostname })),
	},
	adapter: cloudflare(),
	integrations: [mdx()],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			exclude: ["astro:content"],
		},
		ssr: {
			optimizeDeps: {
				exclude: ["astro:content"],
			},
		},
	},
});
