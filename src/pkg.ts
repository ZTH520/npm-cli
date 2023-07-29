import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TContext } from './utils'

export interface pkg {
  name: string
  version: string
  script: string
  url: string
}

function load(ctx: TContext) {
  try {
    const url = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(url, 'utf8'))
    return {
      ...pkg,
      url,
    } as pkg
  }
  catch (error) {
    ctx.log?.('COSTOM', 'red', 'package.json read failure')
    process.exit(1)
  }
}

export default {
  load,
}
