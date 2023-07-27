import { initLog } from './utils'
import { form } from './prompt'
import { load } from './pkg'

(async () => {
  const log = initLog()
  const user = await form([{ name: 'tagName', message: '222' }], '测试')
  log('COSTOM', 'red', user.tagName)
  load()
})()
