import type { TContext, TPlugin } from '../../utils'

const release: TPlugin = async function (ctx: TContext) {
  if (!(await ctx.validate.validateGithubAction(ctx)))
    ctx.quit()
  if (!(await ctx.validate.validateBranch(ctx)))
    ctx.quit()
  if (!(await ctx.validate.validateGitClean(ctx)))
    ctx.quit()

  const branchName
    = await ctx.exec('git', ['branch', '--show-current'])
    || await ctx.exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
  const remoteBranch = await ctx.exec('git', ['config', '--get', `branch.${branchName}.remote`])
  const remoteUrl = await ctx.exec('git', ['remote', 'get-url', remoteBranch])

  ctx.shared.gitRepoUrl = remoteUrl
}

release.lifecycle = 'before:release'

export default release
