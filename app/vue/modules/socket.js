import EventEmitter from 'events'
import {inspect} from 'util'
import store from './vuex/store'
import meta from './meta'

import type {
  ChannelInfo, ChannelID, ChannelMode,
  CharacterName, CharacterStatus
} from './types'

const {WebSocket} = window

export const servers = {
  mainInsecure: 'ws://chat.f-list.net:9722',
  main: 'wss://chat.f-list.net:9799',
  testInsecure: 'ws://chat.f-list.net:8722',
  test: 'ws://chat.f-list.net:8799'
}

export class Socket {
  constructor () {
    // use an event bus to handle WS commands for some convenience,
    // like using .once() and such
    this.bus = new EventEmitter()
    this.ws = null
    this.connected = false
  }

  connect (address?: string = servers.main) {
    // clear the event bus
    this.bus = new EventEmitter()

    // manage connection state
    this.bus.once('open', () => {
      store.dispatch('SetConnectionState', 'online')
    })

    this.bus.once('IDN', () => {
      store.dispatch('SetConnectionState', 'identified')
    })

    this.bus.once('close', () => {
      store.dispatch('SetConnectionState', 'offline')
      this.pushOverlay('login-overlay')
    })

    this.bus.on('error', err => {
      console.error(err)
    })

    // handle server commands on websocket message
    this.bus.on('message', msg => {
      const {type, params} = this.parseServerCommand(msg.data)
      this.handleServerCommand(type, params)
      this.bus.emit(type, params)
    })

    store.dispatch('SetConnectionState', 'connecting')

    // connect & hook up websocket events to the bus
    this.ws = new WebSocket(address)
    this.ws.onopen = () => this.bus.emit('open')
    this.ws.onclose = () => this.bus.emit('close')
    this.ws.onmessage = msg => this.bus.emit('message', msg)
    this.ws.onerror = err => this.bus.emit('error', err)
  }

  disconnect () {
    this.ws.close()
  }

  identify (account: string, ticket: string, character: CharacterName) {
    const params = {
      account, ticket, character,
      method: 'ticket',
      cname: meta.name,
      cversion: meta.version
    }

    this.send('IDN', params)
  }

  parseServerCommand (command: string) {
    const type = command.substring(0, 3)
    const params = command.length > 3 ? JSON.parse(command.substring(4)) : {}
    return {type, params}
  }

  send (command: string, params?: Object) {
    const message = params ? `${command} ${JSON.stringify(params)}` : command
    this.ws.send(message)
    console.log('Sent socket message:', message)
  }

  requestChannels () {
    return new Promise((resolve, reject) => {
      this.send('CHA')
      this.send('ORS')

      let receivedPublic = false
      let receivedPrivate = false

      this.bus.once('CHA', () => {
        receivedPublic = true
        if (receivedPublic && receivedPrivate) {
          resolve()
        }
      })

      this.bus.once('ORS', () => {
        receivedPrivate = true
        if (receivedPublic && receivedPrivate) {
          resolve()
        }
      })
    })
  }

  joinChannel (channel: ChannelID) {
    this.send('JCH', { channel })
  }

  leaveChannel (channel: ChannelID) {
    this.send('LCH', { channel })
  }

  handleServerCommand (type: string, params: Object) {
    switch (type) {
      // successful identification w/ chat server
      case 'IDN': break

      /* ping~! */
      case 'PIN':
        /* pong~! */
        this.send('PIN')
        break

      // receiving server variables
      case 'VAR':
        store.dispatch('SetServerVariable', params.variable, params.value)
        break

      // hello :)
      case 'HLO':
        console.info(params.message)
        break

      // receive # of characters online
      case 'CON':
        console.info(`There are ${params.count} characters online.`)
        break

      // receiving list of friends
      // we can ignore this, since we already got that from the login data
      case 'FRL': break

      // receiving ignore list action
      case 'IGN':
        switch (params.action) {
          case 'init':
            store.dispatch('SetIgnoreList', params.characters)
            break

          default:
            console.warn(`Unknown ignore list action ${params.action}`)
        }
        break

      // receiving list of global admins
      case 'ADL':
        store.dispatch('SetAdminList', params.ops)
        break

      // receiving all characters online
      // comes in multiple batches
      case 'LIS':
        store.dispatch('AddCharacterBatch', params.characters)
        break

      // character came online
      case 'NLN':
        store.dispatch('AddCharacter', params.identity, params.gender)
        break

      // character went offline
      case 'FLN':
        store.dispatch('RemoveCharacter', params.character)
        break

      // character changed status
      case 'STA': {
        const name: CharacterName = params.character
        const status: CharacterStatus = { state: params.status, message: params.statusmsg }
        store.dispatch('SetCharacterStatus', name, status)
        break
      }

      // received list of public channels
      case 'CHA': {
        const channels: ChannelInfo[] = params.channels.map(ch => {
          return { id: ch.name, name: ch.name, userCount: ch.characters }
        })
        store.dispatch('SetPublicChannelList', channels)
        break
      }

      // received list of private channels
      case 'ORS': {
        const channels: ChannelInfo[] = params.channels.map(ch => {
          return { id: ch.name, name: ch.title, userCount: ch.characters }
        })
        store.dispatch('SetPrivateChannelList', channels)
        break
      }

      // receiving initial channel information
      case 'ICH': {
        const id: ChannelID = params.channel
        const mode: ChannelMode = params.mode
        const characters: CharacterName[] = params.users.map(entry => entry.identity)
        store.dispatch('SetChannelCharacterList', id, characters)
        store.dispatch('SetCharacterMode', id, mode)
        break
      }

      // receiving a channel description
      case 'CDS': {
        const { channel: id, description } = params
        store.dispatch('SetChannelDescription', id, description)
        break
      }

      // user joined a channel (could be us)
      // received before the above two
      case 'JCH': {
        const name: CharacterName = params.character.identity
        if (name === store.state.user.character) {
          store.dispatch('AddActiveChannel', params.channel, params.title)
        }
        store.dispatch('AddChannelCharacter', params.channel, name)
        break
      }

      // user left a channel (could be us)
      case 'LCH':
        if (params.character === store.state.user.character) {
          store.dispatch('RemoveActiveChannel', params.channel)
        } else {
          store.dispatch('RemoveChannelCharacter', params.channel, params.character)
        }
        break

      // channel message
      case 'MSG': {
        store.dispatch('AddChannelMessage',
          params.channel,
          params.character,
          params.message,
          'chat')
        break
      }

      // LFRP channel message
      case 'LRP': {
        store.dispatch('AddChannelMessage',
          params.channel,
          params.character,
          params.message,
          'lfrp')
        break
      }

      // private message
      case 'PRI':
        store.dispatch('AddPrivateChatMessage', params.character, params.message)
        break

      default:
        console.log(`Unknown socket message "${type}"\n${inspect(params)}`)
    }
  }
}

export default new Socket()
