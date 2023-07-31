import type { TContext, TLifecycle } from '../utils'

export { default as config } from './before/config'
export { default as beforePublish } from './before/publish'
export { default as beforeRelease } from './before/release'
export { default as afterPublish } from './after/publish'
export { default as success } from './after/success'

export function createPlugin(ctx: TContext) {
  return async function (lifecycle: TLifecycle) {
    ctx.currentLifecycle = lifecycle
    const waitDoPlugins = ctx.plugins.filter(p => p.lifecycle === lifecycle)
    ctx.shared.waitDoPlugins = waitDoPlugins
    for (const p of waitDoPlugins) {
      ctx.runningLifecycle = p
      await p(ctx)
    }
  }
}
