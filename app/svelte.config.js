import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { resolve } from 'path';

// is production
const prod = process.env.NODE_ENV === 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: prod
			? adapterVercel({
					external: ['webgl-heatmap-plus']
			  })
			: adapterAuto(),
		vite: {
			resolve: {
				alias: {
					'webgl-heatmap-plus': prod
						? resolve('./node_modules/webgl-heatmap-plus')
						: resolve('../lib')
				}
			}
		}
	}
};

export default config;
