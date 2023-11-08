import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
    port: 5000,
	nodeResolve: true,
	plugins: [
		esbuildPlugin({
            ts: true, // Enable TypeScript support
            tsx: true, // Enable TSX support
			jsxFactory: 'h',
			jsxFragment: 'Fragment',
		}),
	],
};