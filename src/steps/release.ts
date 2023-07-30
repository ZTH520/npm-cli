import type { TContext } from '../utils'

export async function release(this: TContext) {
  this.log?.('COSTOM', 'green', 'Start generation git release, 开始生成 git release')

  await this.runPluginTasks?.('before:release')

  const nextVersion = this.shared.nextVersion
  if (nextVersion) {
    this.spinner.start()
    await this.exec('git', ['push', 'origin', nextVersion])
    this.spinner.stop()
  }

  this.log?.('COSTOM', 'green', 'Generated release, 已生成release')

  await this.runPluginTasks?.('after:release')
}
