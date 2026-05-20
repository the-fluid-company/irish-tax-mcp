import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const fromHere = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@irish-tax-mcp/core': fromHere('../packages/core/src/index.ts'),
      '@irish-tax-mcp/reference': fromHere('../packages/reference/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
  },
});
