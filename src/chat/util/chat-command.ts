const commandExp = /^\/([a-z]+)\s*(.*)/i

/**
 * Represents information for a chat command entered by the user.
 *
 * Example:
 *
 * input: /op Some Character
 *
 * output:
 * ```ts
 * {
 *   command: 'op',
 *   params: ['Some', 'Character'],
 *   paramString: 'Some Character',
 * }
 * ```
 */
export type CommandInfo = {
  command: string
  params: string[]
  paramString: string
}

export function parseChatCommand(text: string): CommandInfo | void {
  const match = text.match(commandExp)
  if (match) {
    const [, command, paramString] = match
    const params = paramString.split(" ")
    return { command, params, paramString }
  }
}
