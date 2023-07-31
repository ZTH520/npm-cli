import prompt from './prompt'
import pkgHooks from './pkg'
import validate from './validate'
import type { TContext, TMessageKey, TPlugin } from './utils'
import { createRelease, createTag, initGithubActions, publishNpm } from './steps'
import { afterPublish, beforePublish, beforeRelease, config, createPlugin, success } from './plugins'
import { cleanAfterPlugins, createDefaultConfig, exec, getNextVersion, initLog, initSpinner } from './utils'

export type { TContext, TPlugin }

async function setBaseVersion(ctx: TContext) {
  const guessVersion = getNextVersion(ctx.pkg!.version)
  const version = await ctx.prompt.input('Please confirm the version number,请确认发布的版本号', guessVersion)
  ctx.shared.nextVersion = version
}

async function createContext(userPlugins: TPlugin[]) {
  const outPlugins = userPlugins || []
  outPlugins.push(...[config, success])
  const inPlugins = [
    beforePublish,
    afterPublish,
    beforeRelease,
  ]
  const plugins = [...inPlugins, ...outPlugins]
  const ctx: TContext = {
    currentLifecycle: 'config',
    config: createDefaultConfig(),
    shared: {},
    restart: () => {},
    quit() {
      this.spinner.stop()
      process.exit(1)
    },
    exec,
    prompt,
    plugins,
    validate,
    createTag,
    createRelease,
    publishNpm,
    initGithubActions,
    cleanAfterPlugins,
    spinner: initSpinner('cyan'),
  }
  ctx.pkg = pkgHooks.load(ctx)
  ctx.runPluginTasks = createPlugin(ctx)
  return ctx as Required<TContext>
}

export async function cli(userPlugins: TPlugin[]) {
  const ctx = await createContext(userPlugins)
  await ctx.runPluginTasks('config')

  ctx.log = initLog<TMessageKey>(ctx.config.logPrefix)
  ctx.restart = () => {
    cli(userPlugins)
  }

  await setBaseVersion(ctx)
  await ctx[ctx.config.firstCall!]()

  await ctx.runPluginTasks('success')
  return ctx
}
