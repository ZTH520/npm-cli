import { createDefaultConfig, exec, initLog, initSpinner } from './utils'
import prompt from './prompt'
import pkgHooks from './pkg'
import type { TContext } from './utils'

// import { load } from './pkg'
async function createContext() {
  const ctx: TContext = {
    config: createDefaultConfig(),
    shared: {},
    restart: () => {},
    quit() {
      this.spinner.stop()
      process.exit(1)
    },
    exec,
    prompt,
    spinner: initSpinner('cyan'),
  }
  ctx.pkg = pkgHooks.load(ctx)
  return ctx as Required<TContext>
}

export async function cli() {
  const ctx = createContext()
  return ctx
}

(async () => {
  const log = initLog()
  const spinner = initSpinner('gray')
  spinner.start()
  const user = await prompt.form([{ name: 'version', message: '请输入版本号' }], '测试')
  log('COSTOM', 'red', user.version)
  const stdout = await exec('echo', ['test'])
  log('COSTOM', 'red', stdout)
  spinner.stop()
  // load()
})()
