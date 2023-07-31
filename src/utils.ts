import pico from 'picocolors'
import ora from 'ora'
import semver from 'semver'
import { execa } from 'execa'
import type { Color as SColor } from 'ora'
import type { Options as EOptions } from 'execa'
import type { IPkg } from './pkg'
import type prompt from './prompt'
import type validate from './validate'
import type { createPlugin } from './plugins'
import type { createRelease, createTag, initGithubActions, publishNpm } from './steps'

// ------------- typescript definition -------------
type TMessageColor = 'red' | 'green' | 'yellow'
export type TLifecycle = 'config' | 'success' | 'before:publish' | 'after:publish' | 'before:tag' | 'after:tag' | 'before:release' | 'after:release'

export interface TMessageKey {
  COSTOM: string
}

export interface TPlugin {
  (ctx: TContext): Promise<any>
  lifecycle: TLifecycle
}

export interface TContext {
  currentLifecycle: TLifecycle
  config: {
    registry?: string
    logPrefix?: string
    pkgName?: string
    packageManage?: 'npm' | 'yarn' | 'pnpm'
    firstCall?: 'createRelease' | 'createTag' | 'publishNpm'
    allowedBranch?: string[]
    ignoreGitChangeFiles?: string[]
  }
  plugins: TPlugin[]
  restart: () => void
  quit: () => void
  exec: typeof exec
  prompt: typeof prompt
  shared: {
    nextVersion?: string
    waitDoPlugins?: TPlugin[]
    gitRepoUrl?: string
    [x: string]: any
  }
  validate: typeof validate
  createTag: typeof createTag
  createRelease: typeof createRelease
  publishNpm: typeof publishNpm
  initGithubActions: typeof initGithubActions
  cleanAfterPlugins: typeof cleanAfterPlugins
  spinner: ReturnType<typeof initSpinner>
  runningLifecycle?: TPlugin
  runPluginTasks?: ReturnType<typeof createPlugin>
  log?: ReturnType<typeof initLog>
  pkg?: {
    [key: string]: any
  } & IPkg
}
// ------------- variable definition -------------
export const PKG_NAME = 'npm-cli'
export const messages = new Map<keyof TMessageKey, string | Function>([
  ['COSTOM', (msg: string) => `${msg}`],
])
// ------------- function definition -------------
export function exec(bin: string, args: readonly string[], options: EOptions = {}) {
  return new Promise<string>((resolve, reject) => {
    execa(bin, args, { stdin: 'pipe', ...options })
      .then(({ stdout }) => {
        resolve(stdout)
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
  })
}

export function createLog<T>(message: Map<string, string | Function>, prefix: string) {
  return function (messageType: keyof T, color: TMessageColor = 'red', rest?: any) {
    let msg = message.get(messageType as string)
    if (typeof msg === 'function')
      msg = msg(rest)
    console.log(pico[color](`[${prefix}]: ${msg}`))
  }
}

export function initLog<T extends TMessageKey>(prefix: string = PKG_NAME) {
  return createLog<T>(messages, prefix)
}

export function initSpinner(color: SColor, text: string = 'Executing... 正在执行中...') {
  const spinner = ora({
    text,
    color,
  })
  return spinner
}

export function getNextVersion(version: string) {
  const isValid = semver.valid(version)
  const major = semver.major(version)
  const minor = semver.minor(version)
  const patch = semver.patch(version)
  return isValid ? `${major}.${minor}.${patch + 1}` : ''
}

export function cleanAfterPlugins(this: TContext) {
  const waitDoPlugins = this.shared.waitDoPlugins || []
  const index = waitDoPlugins.findIndex(p => p === this.runningLifecycle)

  if (index > -1)
    this.shared.waitDoPlugins = this.shared.waitDoPlugins?.slice(0, index + 1)
}

export function createDefaultConfig() {
  return {
    logPrefix: PKG_NAME,
    allowedBranch: ['master'],
    ignoreGitChangeFiles: [
      'yarn.lock',
      'yarn-error.log',
      'package-lock.json',
      'pnpm-lock.yaml',
    ],
    packageManage: 'pnpm',
    registry: 'https://registry.npmjs.org/',
    firstCall: 'createTag',
  } as TContext['config']
}
