import type { TContext, TPlugin } from '../../utils'

const publish: TPlugin = async function (ctx: TContext) {
  ctx.log?.('COSTOM', 'green', 'Published npm,已发布到npm')

  if (await ctx.prompt.comfirm('是否将文件变动推送到远程仓库')) {
    const form = await ctx.prompt.form(
      [
        {
          name: 'remark',
          message: '请输入commit备注',
          initial: `publish ${ctx.shared.nextVersion}`,
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
      ctx.log?.('COSTOM', 'green', '推送成功,已更新package.json')
    }
    catch (error) {
      ctx.log?.('COSTOM', 'yellow', '推送失败,请手动执行')
    }
  }
}

publish.lifecycle = 'after:publish'

export default publish
