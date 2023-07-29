import type { TContext, TPlugin } from '../../utils'
import pkgHooks from '../../pkg'

const config: TPlugin = async function (ctx: TContext) {
  if (ctx.config.pkgName) {
    const pkg = pkgHooks.load(ctx)
    if (pkg.name !== ctx.config.pkgName) {
      ctx.log?.(
        'COSTOM',
        'red',
        `package.json中的name（${pkg.name}）与配置的pkgName（${ctx.config.pkgName}）不一致`,
      )
      ctx.quit()
    }
  }
}

config.lifecycle = 'config'

export default config
