import type { TContext } from './utils'

async function validateBranch(ctx: TContext) {
  const allowedBranch = ctx.config.allowedBranch
  const currentBranch = await ctx.exec('git', ['branch', '--show-current'])
  if (!allowedBranch?.some(branch => branch === currentBranch)) {
    ctx.log?.('COSTOM', 'red', `The ${allowedBranch} does not support, 当前分支不支持执行操作`)
    return false
  }
  return true
}

async function validateGitClean(ctx: TContext) {
  const uncleaned = await ctx.exec('git', ['status', '--porcelain'])
  const ignoreGitChangeFiles = ctx.config.ignoreGitChangeFiles || []
  if (uncleaned) {
    const changes = uncleaned.split('\n')
    const restChanges = changes.reduce((acc: string[], cur) => {
      const isExist = ignoreGitChangeFiles.includes(cur)
      if (!isExist)
        acc.push(cur)
      return acc
    }, [])
    if (restChanges.length) {
      ctx.log?.('COSTOM', 'red', 'There are uncommitted file changes,本地存在未提交的文件变动')
      return false
    }
  }
  return true
}

export default {
  validateBranch,
  validateGitClean,
}
