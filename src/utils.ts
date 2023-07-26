import pico from 'picocolors'

// ------------- typescript definition -------------
type TMessageColor = 'red' | 'green' | 'yellow'

export interface TMessageKey {
  COSTOM: string
}
// ------------- variable definition -------------
export const PKG_NAME = 'npm-cli'
export const messages = new Map<keyof TMessageKey, string | Function>([
  ['COSTOM', (msg: string) => `${msg}`],
])
// ------------- function definition -------------
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
