import type { TContext } from '../utils'
import pkgHooks from '../pkg'

export async function publish(this: TContext) {
  this.log?.('COSTOM', 'green', 'Start publishing to npm,开始发布到 npm')

  await this.runPluginTasks!('before:publish')

  if (this.pkg) {
    const version = this.shared.nextVersion
    const isUpdateVersion = await this.prompt.comfirm(
        `Do you want to update the new version number,是否将新的版本号(${version})更新到package.json文件`)

    if (isUpdateVersion) {
      pkgHooks.updateVersion(this.pkg.url, version!)
      this.pkg = pkgHooks.load(this)
    }
    else {
      this.quit()
    }

    this.log?.(
      'COSTOM',
      'green',
      `Execute npm package publishing,执行npm包发布: 版本号为${version}、包名称为${this.pkg.name}`,
    )

    this.spinner.start()
    await this.exec('npm', ['publish', '--access', 'public'])
    this.spinner.stop()

    this.runPluginTasks?.('after:publish')
  }
}
