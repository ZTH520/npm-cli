import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  shims: false,
  clean: true,
}
