import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/* Focused unit tests, not a browser harness.
 *
 * What is worth testing here is the part of Guneku that decides who may do what and what a
 * stranger is shown — the authorisation boundary, the ownership scoping and the public
 * projection. Those are pure decisions over inputs, so they are tested directly, with Clerk
 * and Neon mocked at the module boundary. Nothing in this suite opens a database connection,
 * talks to Clerk, or renders a page.
 *
 * `server-only` is aliased to an empty module. The real package exists to make a build fail
 * when a server module is imported into a client bundle; under Node it has no "react-server"
 * condition to resolve and throws on import, which would stop these tests from importing the
 * very modules they exist to check. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', '*.test.ts'],
  },
  resolve: {
    alias: {
      '@':           fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)),
    },
  },
})
