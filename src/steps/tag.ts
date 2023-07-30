import type { TContext } from '../utils'

export async function tag(this: TContext) {
  this.log?.('COSTOM', 'green', 'Start generation git tag, 开始生成 git tag')
  const nextTag = `v${this.shared.nextVersion}`
  const form = await this.prompt.form(
    [
      {
        name: 'tagName',
        message: 'Please fill in tag name,请填写 tag 名称',
        initial: nextTag || '',
      },
      {
        name: 'remark',
        message: 'Please fill in the remarks,请填写备注',
        initial: 'create tag',
      },
    ],
    'Please fill out the form,请填写表单',
  )

  const REG_TAG = /^(v)[1-9]?\d(.([1-9]?\d)){2}$/

  if (!form.tagName) {
    this.log?.('COSTOM', 'yellow', 'Please fill in tag name, 请填写 tag 名称')
    this.createTag()
    return
  }
  else if (!REG_TAG.test(form.tagName)) {
    this.log?.('COSTOM', 'yellow', 'Tag must consist of v and numbers,tag必须由v加数字组成,如v1.0.0')
    this.createTag()
    return
  }

  this.shared.nextVersion = form.tagName

  await this.runPluginTasks!('before:tag')

  let isBreak = false
  const tagString = await this.exec('git', ['tag'])
  if (tagString) {
    const tag = tagString.split('\n')
    isBreak = tag.includes(form.tagName)
  }

  !isBreak && this.exec('git', ['tag', form.tagName, '-m', form.remark])
  this.log?.('COSTOM', 'green', `Generated tag, The new tag is ${form.tagName},已生成 tag, 新tag为: ${form.tagName}`)

  await this.runPluginTasks!('after:tag')
}
