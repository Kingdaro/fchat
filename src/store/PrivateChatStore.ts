import Vue from 'vue'
import { CharacterStore } from './CharacterStore'
import { PrivateChat, Message } from './models'

export class PrivateChatStore {
  private privateChats = {} as Dictionary<PrivateChat>
  private openPrivateChats = {} as Dictionary<true>

  getPrivateChat(partner: string) {
    return (
      this.privateChats[partner] ||
      Vue.set(this.privateChats, partner, new PrivateChat(partner))
    )
  }

  openPrivateChat(partner: string) {
    Vue.set(this.openPrivateChats, partner, true)
    return this.privateChats[partner]
  }

  closePrivateChat(partner: string) {
    Vue.delete(this.openPrivateChats, partner)
  }

  getOpenPrivateChats() {
    return Object.keys(this.openPrivateChats)
  }

  handleSocketCommand(cmd: string, params: any, characters: CharacterStore) {
    if (cmd === 'PRI') {
      const privateChat = this.openPrivateChat(params.character)

      privateChat.messages.push(
        new Message(
          characters.getCharacter(params.character),
          params.message,
          'normal',
        ),
      )
    }
  }
}
