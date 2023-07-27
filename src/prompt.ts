import enquirer from 'enquirer'

interface TPromptReturnKey {
  confirmValue: boolean
  inputValue: string
  selectValue: any
}

interface Choice {
  name: string
  message?: string
  value?: unknown
  hint?: string
  role?: string
  enabled?: boolean
  disabled?: boolean | string
}

interface TAnyObj {
  [key: string]: any
}

export async function comfirm<T extends TPromptReturnKey>(message: string, initial: boolean = true) {
  const { confirmValue } = await enquirer.prompt<T>({
    type: 'confirm',
    name: 'confirmValue',
    message,
    initial,
  })
  return confirmValue
}

export async function input<T extends TPromptReturnKey>(message: string, initial: string = '') {
  const { inputValue } = await enquirer.prompt<T>({
    type: 'input',
    name: 'inputValue',
    message,
    initial,
  })
  return inputValue
}

export async function select<T extends TPromptReturnKey>(choices: (string | Choice)[], message: string) {
  const { selectValue } = await enquirer.prompt<T>({
    type: 'select',
    name: 'selectValue',
    message,
    choices,
  })
  return selectValue
}

export async function form(choices: { name: string; message: string; initial?: string }[], message: string, name: string = 'user') {
  const { [name]: user } = await enquirer.prompt<TAnyObj>({
    type: 'form',
    name,
    message,
    choices,
  })
  return user
}
