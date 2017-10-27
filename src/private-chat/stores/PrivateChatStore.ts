import { observable } from 'mobx'
import { Message } from 'src/message/models/Message'
import { PrivateChat } from 'src/private-chat/models/PrivateChat'

export class PrivateChatStore {
  @observable privateChats = new Map<string, PrivateChat>()
  @observable openPrivateChats = new Map<string, true>()

  getPrivateChat(partner: string) {
    let privateChat = this.privateChats.get(partner)
    if (!privateChat) {
      privateChat = new PrivateChat(partner)
      this.privateChats.set(partner, privateChat)
    }
    return privateChat
  }

  openPrivateChat(partner: string) {
    this.openPrivateChats.set(partner, true)
    return this.getPrivateChat(partner)
  }

  closePrivateChat(partner: string) {
    this.openPrivateChats.delete(partner)
  }

  getOpenPrivateChats() {
    return Array.from(this.openPrivateChats.keys()).map(name => this.getPrivateChat(name))
  }

  handleSocketCommand(cmd: string, params: any) {
    if (cmd === 'PRI') {
      const privateChat = this.openPrivateChat(params.character)
      privateChat.messages.push(new Message(params.character, params.message, 'normal'))
    }
  }
}
