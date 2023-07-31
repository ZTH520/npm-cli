import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { resolveModule } from 'local-pkg'
import type { TContext } from '../utils'

export async function actions(this: TContext, dir?: string, prefix?: string) {
  dir = dir || resolveModule('@cn_zth/npm-cli')
  prefix = prefix || resolve(process.cwd(), '.github', 'workflows')

  if (dir) {
    copyFileSync(
      resolve(dir, '..', '..', '.github', 'workflows', 'create-release.yml'),
      resolve(prefix, 'release.yml'),
    )

    this.log?.('COSTOM', 'green', 'github Actions创建成功,正在帮您推送到远程~~')

    this.exec('git', ['add', '.'])
    const remark = await this.prompt.input('请为当前commit添加备注', 'ci: initial github Actions')
    this.spinner.start()
    this.exec('git', ['commit', '-m', remark])
    this.exec('git', ['push', '-f'])
    this.log?.('COSTOM', 'green', 'github Actions初始化成功')
    this.spinner.stop()
  }

  this.log?.('COSTOM', 'green', 'github Actions初始化成功')
}
