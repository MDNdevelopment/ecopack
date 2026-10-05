// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://ecopackvenezuela.com',
	trailingSlash: 'never',
	redirects: {
		'/contacto': '/#contacto',
	},
	integrations: [sitemap()],
	image: {
		responsiveStyles: true,
	},
	build: {
		inlineStylesheets: 'auto',
	},
	compressHTML: true,
});
