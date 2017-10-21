import { Channel, Message } from './models'
import { StoredValue } from '@/stored-value'

export type ChannelID = string

export class ChannelStore {
  private channels = new Map<ChannelID, Channel>()
  private joinedChannels = new Map<ChannelID, true>()
  private storedChannels = new StoredValue<string[]>('ChannelStore_joinedChannels')

  getChannel(id: ChannelID) {
    let channel = this.channels.get(id)
    if (!channel) {
      channel = new Channel(id)
      this.channels.set(id, channel)
    }
    return channel
  }

  addJoinedChannel(id: ChannelID) {
    this.joinedChannels.set(id, true)
    this.saveJoinedChannels()
  }

  removeJoinedChannel(id: ChannelID) {
    this.joinedChannels.delete(id)
    this.saveJoinedChannels()
  }

  getJoinedChannels() {
    return Object.keys(this.joinedChannels).map(id => this.getChannel(id))
  }

  async saveJoinedChannels() {
    const channelIDs = this.getJoinedChannels().map(ch => ch.id)
    await this.storedChannels.save(channelIDs)
  }

  async restoreJoinedChannels() {
    const restoredChannels = await this.storedChannels.restore()
    return restoredChannels || []
  }

  handleSocketCommand(cmd: string, params: any) {
    if (cmd === 'FLN') {
      this.channels.forEach(channel => {
        channel.users = channel.users.filter(name => name !== params.character)
      })
    }

    if (cmd === 'JCH') {
      const channel = this.getChannel(params.channel)
      const name = params.character.identity
      channel.title = params.title
      channel.users.push(name)
    }

    if (cmd === 'LCH') {
      const channel = this.getChannel(params.channel)
      channel.users = channel.users.filter(name => name !== params.character)
    }

    if (cmd === 'ICH') {
      const channel = this.getChannel(params.channel)
      channel.mode = params.mode
      channel.users = params.users.map((user: { identity: string }) => user.identity)
    }

    if (cmd === 'CDS') {
      const channel = this.getChannel(params.channel)
      channel.description = params.description
    }

    if (cmd === 'COL') {
      const channel = this.getChannel(params.channel)
      channel.description = params.oplist
    }

    if (cmd === 'MSG') {
      const channel = this.getChannel(params.channel)
      channel.messages.push(new Message(params.character, params.message, 'normal'))
    }

    if (cmd === 'LRP') {
      const channel = this.getChannel(params.channel)
      channel.messages.push(new Message(params.character, params.message, 'lfrp'))
    }
  }
}
