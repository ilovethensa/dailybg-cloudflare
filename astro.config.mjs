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
