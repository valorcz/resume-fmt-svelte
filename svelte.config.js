import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: "index.html",
			precompress: false,
			strict: true 
		}),
		// MOVED INSIDE THE 'kit' OBJECT
		paths: {
			base: process.env.BASE_PATH
		}
	},
	preprocess: vitePreprocess(),
};

export default config;
