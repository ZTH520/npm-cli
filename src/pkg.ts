import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TContext } from './utils'

export interface IPkg {
  name: string
  version: string
  scripts: string
  url: string
}

function load(ctx: TContext) {
  try {
    const url = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(url, 'utf8'))
    return {
      ...pkg,
      url,
    } as IPkg
  }
  catch (error) {
    ctx.log?.('COSTOM', 'red', 'package.json read failure')
    process.exit(1)
  }
}

function updateVersion(path: string, version: string) {
  if (existsSync(path)) {
    let code = readFileSync(path, 'utf-8')
    const reg = /"[\s]*?version[\s]*?"[\s]*?:[\s]*?"(.*?)"/g
    const res = code.match(reg)
    if (Array.isArray(res))
      code = code.replace(res[0], `"version": "${version}"`)
    writeFileSync(path, code, 'utf-8')
  }
}

export default {
  updateVersion,
  load,
}
