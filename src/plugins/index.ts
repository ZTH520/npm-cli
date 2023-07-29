import type { TContext, TLifecycle } from '../utils'

export { default as config } from './before/config'

export function createPlugin(ctx: TContext) {
  return async function (lifecycle: TLifecycle) {
    ctx.currentLifecycle = lifecycle
    const waitDoPlugins = ctx.plugins.filter(p => p.lifecycle === lifecycle)
    ctx.shared.waitDoPlugins = waitDoPlugins
    for (const p of waitDoPlugins) {
      ctx.runningLifecycle = p.lifecycle
      await p(ctx)
    }
  }
}
