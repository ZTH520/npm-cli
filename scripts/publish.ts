import { cli } from '../dist'

import type { TContext, TPlugin } from '../dist'

const config: TPlugin = async function (ctx: TContext) {
  ctx.config.logPrefix = 'npm-cli'
  ctx.config.allowedBranch = ['master']
  ctx.config.packageManage = 'pnpm'
  ctx.config.ignoreGitChangeFiles?.push(
    ...['scripts/publish.ts', 'package.json'],
  )
  ctx.config.pkgName = '@cn_zth/npm-cli'
  ctx.config.firstCall = 'publishNpm'
}
config.lifecycle = 'config'

const msgs = {
  isBuild: 'whether or not build,是否打包',
  selectScript: 'select script,选择打包脚本',
}
const publishBefore: TPlugin = async (ctx: TContext) => {
  if (await ctx.prompt.comfirm(msgs.isBuild)) {
    ctx.spinner.start()
    const buildScript = await ctx.prompt.select(
      Object.keys(ctx.pkg!.scripts),
      msgs.selectScript,
    )
    await ctx.exec(ctx.config.packageManage!, ['run', buildScript])
    ctx.spinner.stop()
    ctx.log?.('COSTOM', 'green', 'build success,打包成功~~')
  }
}
publishBefore.lifecycle = 'before:publish'

const before: TPlugin[] = [config, publishBefore];

(async () => {
  await cli([...before])
})()
