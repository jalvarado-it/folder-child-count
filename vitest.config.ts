import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			// The `obsidian` package is types-only; point tests at a runtime stub.
			obsidian: fileURLToPath(
				new URL('./tests/obsidian-mock.ts', import.meta.url),
			),
		},
	},
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
	},
});
