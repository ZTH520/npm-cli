import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function load() {
  try {
    const url = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(url, 'utf8'))
    return {
      ...pkg,
      url,
    }
  }
  catch (error) {
    process.exit(1)
  }
}
