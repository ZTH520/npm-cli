import pico from 'picocolors'
import ora from 'ora'
import semver from 'semver'
import { execa } from 'execa'
import type { Options as EOptions } from 'execa'
import type { Color as SColor } from 'ora'
import type prompt from './prompt'

// ------------- typescript definition -------------
type TMessageColor = 'red' | 'green' | 'yellow'

export interface TMessageKey {
  COSTOM: string
}

export interface TPlugin {
  ctx: Promise<TContext>
}

export interface TContext {
  config: {
    registry?: string
    logPrefix?: string
    packageManage?: 'npm' | 'yarn' | 'pnpm'
    allowedBranch?: string[]
    ignoreGitChangeFiles?: string[]
  }
  restart: () => void
  quit: () => void
  exec: typeof exec
  prompt: typeof prompt
  shared: {
    nextVersion?: string
  }
  spinner: ReturnType<typeof initSpinner>
  log?: ReturnType<typeof initLog>
  pkg?: {
    [key: string]: any
  }
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
  } as TContext['config']
}
