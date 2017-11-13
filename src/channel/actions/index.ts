import { sendSocketCommand } from 'src/chat/actions/socketActions'
import { ChatMessage } from 'src/chat/models/ChatMessage'
import { channelStore, chatStore } from 'src/stores'

export function joinChannel(id: string) {
  sendSocketCommand('JCH', { channel: id })
}

export function leaveChannel(id: string) {
  sendSocketCommand('LCH', { channel: id })
}

export function sendChannelMessage(id: string, message: string) {
  sendSocketCommand('MSG', { channel: id, message })

  const channel = channelStore.getChannel(id)
  if (channel) {
    channel.messages.push(new ChatMessage('normal', message, chatStore.identity))
  }
}

export async function saveJoinedChannels() {
  await channelStore.saveJoinedChannels(chatStore.identity)
}

export async function restoreJoinedChannels() {
  const channels = await channelStore.restoreJoinedChannels(chatStore.identity)
  channels.forEach(joinChannel)
}
