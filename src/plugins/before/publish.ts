import type { TContext, TPlugin } from '../../utils'

const msgs = {
  login: '无法获取当前登陆用户,请手动检查当前登陆的npm账户,并确认是否继续?',
  user: (userName: string) => `检测到当前登录的npm账号: ${userName},请确认是否继续?`,
  registry: (registry: string) => `请求切换到npm: ${registry}`,
}

const publish: TPlugin = async function (ctx: TContext) {
  const registry = ctx.config.registry!
  if (await ctx.prompt.comfirm(msgs.registry(registry)))
    ctx.exec('npm', ['set', 'registry', registry])
  else
    ctx.quit()

  ctx.log?.('COSTOM', 'green', 'Switched to npm,已经切换到 npm')

  try {
    ctx.spinner.start()
    const loginned = await ctx.exec('npm', ['whoami', '--registry', registry])
    ctx.spinner.stop()

    if (loginned) {
      if (!(await ctx.prompt.comfirm(msgs.user(loginned))))
        ctx.quit()
    }
    else {
      if (!(await ctx.prompt.comfirm(msgs.login)))
        ctx.quit()
    }
  }
  catch (error) {
    if (!(await ctx.prompt.comfirm(msgs.login)))
      ctx.quit()
  }
}

publish.lifecycle = 'before:publish'

export default publish
