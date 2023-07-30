import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  splitting: true,
  shims: false,
  clean: true,
}
