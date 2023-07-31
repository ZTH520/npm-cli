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
  isChangeLog: 'whether or not generation CHANGELOG,是否生成 CHANGELOG',
  selectScript: 'select script,选择脚本',
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

const publishAfter: TPlugin = async (ctx: TContext) => {
  await ctx.createTag()
}
publishAfter.lifecycle = 'after:publish'

const afterTag: TPlugin = async (ctx: TContext) => {
  await ctx.createRelease()
}
afterTag.lifecycle = 'after:tag'

const success: TPlugin = async (ctx: TContext) => {
  if (await ctx.prompt.comfirm(msgs.isChangeLog)) {
    ctx.spinner.start()
    const logScript = await ctx.prompt.select(
      Object.keys(ctx.pkg!.scripts),
      msgs.selectScript,
    )
    await ctx.exec(ctx.config.packageManage!, ['run', logScript])
    ctx.log?.('COSTOM', 'green', 'Generated success, 已生成 CHANGELOG')
    ctx.spinner.stop()

    if (await ctx.prompt.comfirm('是否将文件变动推送到远程仓库')) {
      const form = await ctx.prompt.form(
        [
          {
            name: 'remark',
            message: '请输入commit备注',
            initial: `release: ${ctx.shared.nextVersion}`,
          },
        ],
        '请填写表单',
      )

      await ctx.exec('git', ['add', '.'])
      await ctx.exec('git', ['commit', '-m', form.remark])

      try {
        ctx.spinner.start()
        await ctx.exec('git', ['push'])
        ctx.spinner.stop()
        ctx.log?.('COSTOM', 'green', '推送成功~~')
      }
      catch (error) {
        ctx.log?.('COSTOM', 'yellow', '推送失败,请手动执行')
      }
    }
  }
}
success.lifecycle = 'success'

const before: TPlugin[] = [config, publishBefore]
const after: TPlugin[] = [success, publishAfter, afterTag];

(async () => {
  await cli([...before, ...after])
})()
